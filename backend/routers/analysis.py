"""
routers/analysis.py
Endpoint principal de analisis de datasets.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
import pandas as pd
import io
import json
import math
import pandas as pd

def clean_json_nans(obj):
    if isinstance(obj, dict):
        return {k: clean_json_nans(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_json_nans(v) for v in obj]
    elif isinstance(obj, float):
        if pd.isna(obj) or math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    return obj

import asyncio
import hashlib
import time
import os
import shutil
import tempfile
import logging
import chardet
import csv
import requests
from concurrent.futures import ThreadPoolExecutor
from cachetools import TTLCache

ANALYSIS_CACHE = TTLCache(maxsize=50, ttl=3600)

from core.data_cleaner import clean_dataframe
from core.data_profiler import profile_dataframe
from core.chart_generator import auto_charts
from models.forecaster import run_forecast
from models.segmentation import run_clustering
from models.anomaly_detector import run_anomaly_detection
from models.feature_importance import run_feature_importance

router = APIRouter()

logger = logging.getLogger("analysis_pipeline")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - [%(levelname)s] - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 500)) * 1024 * 1024

def format_number(n, prefix=""):
    if isinstance(n, float):
        if abs(n) >= 1_000_000:
            return f"{prefix}{n/1_000_000:.1f}M"
        if abs(n) >= 1_000:
            return f"{prefix}{n/1_000:.1f}K"
        return f"{prefix}{n:,.2f}"
    if isinstance(n, int):
        if abs(n) >= 1_000_000:
            return f"{prefix}{n/1_000_000:.1f}M"
        if abs(n) >= 1_000:
            return f"{prefix}{n/1_000:.1f}K"
        return f"{prefix}{n:,}"
    return str(n)


@router.post("/analyze")
async def analyze(
    file: Optional[UploadFile] = File(None), 
    file_url: Optional[str] = Form(None),
    filename_override: Optional[str] = Form(None),
    target_col: Optional[str] = Form(None)
):
    t_start = time.time()
    
    if not file and not file_url:
        raise HTTPException(status_code=400, detail="Debe enviar 'file' o 'file_url'.")

    filename = filename_override or (file.filename if file else "dataset")
    t = str(target_col).lower() if target_col else "none"
    
    # Manejar caché según la fuente
    if file_url:
        h = hashlib.sha256(file_url.encode()).hexdigest()
        file_size = 0 # No lo sabemos exacto sin hacer HEAD
    else:
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        if file_size > MAX_FILE_SIZE:
            logger.error(f"Rechazo temprano: Archivo demasiado grande ({file_size} bytes)")
            raise HTTPException(status_code=413, detail=f"El archivo excede el límite máximo de {MAX_FILE_SIZE/(1024*1024):.1f}MB.")
        chunk = await file.read(1024 * 1024)
        h = hashlib.sha256(chunk).hexdigest()
        file.file.seek(0)
        
    cache_key = f"{h}_{file_size}_{t}"
    if cache_key in ANALYSIS_CACHE:
        logger.info(f"CACHE HIT para {filename}")
        return ANALYSIS_CACHE[cache_key]

    logger.info(f"Iniciando procesamiento de {filename}")
    
    fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1] or ".csv")
    try:
        if file_url:
            # STREAMING DOWNLOAD DESDE FIREBASE STORAGE
            # Evita cargar los 200MB en RAM usando streaming de requests
            logger.info(f"Descargando archivo desde URL (Streaming a disco)...")
            try:
                with requests.get(file_url, stream=True, timeout=30) as r:
                    r.raise_for_status()
                    with os.fdopen(fd, 'wb') as f:
                        # Copy 8KB chunks from network straight to disk
                        shutil.copyfileobj(r.raw, f)
            except requests.exceptions.Timeout:
                raise HTTPException(status_code=504, detail="Timeout al descargar el archivo desde Storage.")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error al descargar el archivo: {str(e)}")
        else:
            with os.fdopen(fd, 'wb') as f:
                shutil.copyfileobj(file.file, f)
            
        res = await asyncio.to_thread(_analyze_sync, temp_path, filename, target_col)
        
        ANALYSIS_CACHE[cache_key] = res
        logger.info(f"Pipeline completado para {filename} en {time.time()-t_start:.2f}s")
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fatal en el pipeline para {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def detect_csv_format(file_path: str):
    enc = 'utf-8'
    sep = None
    try:
        with open(file_path, 'rb') as f:
            raw = f.read(100000)
        res = chardet.detect(raw)
        if res and res['encoding']:
            enc = res['encoding']
    except Exception as e:
        logger.warning(f"Error detectando encoding, usando utf-8: {e}")

    try:
        with open(file_path, 'r', encoding=enc, errors='ignore') as f:
            sample = f.read(4096)
        dialect = csv.Sniffer().sniff(sample)
        sep = dialect.delimiter
    except Exception as e:
        pass
        
    return enc, sep


def _parse_json_intelligent(file_path: str):
    """Parsea JSON aplanando estructuras anidadas si existen."""
    try:
        # Cargamos el json en memoria (los JSON no suelen ser de 200MB, pero si lo son, 
        # esto puede ser pesado. Json_normalize requiere el dict en memoria).
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, list):
            # Es un array de objetos. Intentamos aplanar (flatten) los objetos anidados.
            df = pd.json_normalize(data)
        elif isinstance(data, dict):
            # Podría ser un orient='index' o un wrapper tipo {"data": [...]}
            # Buscamos la llave más grande que sea un array
            array_keys = [k for k, v in data.items() if isinstance(v, list)]
            if array_keys:
                longest_array_key = max(array_keys, key=lambda k: len(data[k]))
                df = pd.json_normalize(data[longest_array_key])
            else:
                # Fallback genérico a pandas
                df = pd.read_json(file_path)
        else:
            raise ValueError("El JSON no tiene una estructura tabular reconocida.")
            
        return df
    except Exception as e:
        # Fallback ultra-seguro (si es muy plano y pd.read_json puede con él)
        logger.warning(f"json_normalize falló ({e}), intentando fallback nativo de pandas.")
        try:
            return pd.read_json(file_path, orient='records')
        except:
            return pd.read_json(file_path)

def _analyze_sync(file_path: str, filename: str, target_col: Optional[str]):
    try:
        fname_lower = filename.lower()
        t_read = time.time()
        df_raw = None
        
        if fname_lower.endswith(".json"):
            df_raw = _parse_json_intelligent(file_path)
        elif fname_lower.endswith(".csv") or not fname_lower.endswith((".xlsx", ".xls")):
            enc, sep = detect_csv_format(file_path)
            try:
                if sep:
                    df_raw = pd.read_csv(file_path, encoding=enc, sep=sep, engine='c')
                else:
                    df_raw = pd.read_csv(file_path, encoding=enc, sep=None, engine='python')
            except Exception as e:
                df_raw = pd.read_csv(file_path, encoding="latin1", sep=None, engine="python")
        else:
            df_raw = pd.read_excel(file_path)

        if df_raw is None or df_raw.empty:
            raise HTTPException(status_code=400, detail="El archivo subido está vacío o no es tabular.")

        logger.info(f"[Etapa 1] Archivo leído ({len(df_raw)} filas) en {time.time()-t_read:.2f}s")
        
        t_clean = time.time()
        df_clean, cleaning_report = clean_dataframe(df_raw)
        
        t_prof = time.time()
        profile = profile_dataframe(df_clean)

        active_target = None
        if target_col:
            target_clean = str(target_col).strip().lower()
            for col in profile.numeric_columns:
                if str(col).strip().lower() == target_clean:
                    active_target = col
                    break
            if not active_target:
                for col in df_clean.columns:
                    if str(col).strip().lower() == target_clean:
                        active_target = col
                        break
        
        if not active_target:
            if profile.suggested_targets:
                active_target = profile.suggested_targets[0]
            elif profile.numeric_columns:
                active_target = profile.numeric_columns[0]
            else:
                active_target = df_clean.columns[0]

        kpis = {
            "Registros": f"{profile.n_rows:,}",
            "Columnas": profile.n_cols,
        }
        if active_target in profile.numeric_columns:
            series = df_clean[active_target].dropna()
            kpis["Total"] = format_number(float(series.sum()))
            kpis["Promedio"] = format_number(float(series.mean()))
            kpis["Máximo"] = format_number(float(series.max()))
            kpis["Mínimo"] = format_number(float(series.min()))

        charts = auto_charts(df_clean, profile, active_target)
        
        forecast_res: Dict[str, Any] = {"chart_data": None, "metrics": {}}
        feature_res: Dict[str, Any] = {"chart_importance": None, "chart_shap": None, "metrics": {}}
        anomaly_res: Dict[str, Any] = {"chart_data": None, "metrics": {}}
        seg_res: Dict[str, Any] = {"scatter_data": None, "radar_data": None, "metrics": {}}
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            fut_forecast, fut_feature, fut_anomaly, fut_segmentation = None, None, None, None
            
            if profile.date_columns and active_target in profile.numeric_columns:
                fut_forecast = executor.submit(run_forecast, df_clean, date_col=profile.date_columns[0], value_col=active_target, periods=60)
            
            if active_target in profile.numeric_columns:
                feats = [c for c in profile.numeric_columns if c != active_target]
                fut_feature = executor.submit(run_feature_importance, df_clean, active_target, feats, categorical_cols=profile.categorical_columns)
                
            fut_anomaly = executor.submit(
                run_anomaly_detection, df_clean, numeric_cols=profile.numeric_columns, 
                target_col=active_target if active_target in profile.numeric_columns else None, 
                date_col=profile.date_columns[0] if profile.date_columns else None
            )
            
            if len(profile.numeric_columns) >= 2:
                label_c = profile.categorical_columns[0] if profile.categorical_columns else None
                fut_segmentation = executor.submit(run_clustering, df_clean, numeric_cols=profile.numeric_columns[:6], label_col=label_c)
                
            if fut_forecast:
                try:
                    _, f_fig, f_metrics = fut_forecast.result()
                    forecast_res = {"chart_data": f_fig, "metrics": f_metrics}
                except Exception as e:
                    forecast_res["metrics"] = {"error": str(e)}
                    
            if fut_feature:
                try:
                    fi_fig, shap_fig, fi_metrics = fut_feature.result()
                    feature_res = {"chart_importance": fi_fig, "chart_shap": shap_fig, "metrics": fi_metrics}
                except Exception as e:
                    feature_res["metrics"] = {"error": str(e)}
                    
            if fut_anomaly:
                try:
                    _, a_fig, a_metrics = fut_anomaly.result()
                    anomaly_res = {"chart_data": a_fig, "metrics": a_metrics}
                except Exception as e:
                    anomaly_res["metrics"] = {"error": str(e)}
                    
            if fut_segmentation:
                try:
                    _, s_scatter, s_prof, s_metrics = fut_segmentation.result()
                    seg_res = {"scatter_data": s_scatter, "radar_data": s_prof, "metrics": s_metrics}
                except Exception as e:
                    seg_res["metrics"] = {"error": str(e)}

        narrative_res = {
            "text": "Generando informe avanzado con IA...",
            "source": "pending"
        }

        return {
            "filename": filename,
            "target_col": active_target,
            "profile": {
                "n_rows": profile.n_rows,
                "n_cols": profile.n_cols,
                "quality_score": profile.quality_score,
                "quality_label": profile.quality_label,
                "numeric_columns": profile.numeric_columns,
                "date_columns": profile.date_columns,
                "categorical_columns": profile.categorical_columns,
                "suggested_targets": profile.suggested_targets,
            },
            "cleaning_report": {
                "actions": cleaning_report.actions,
                "duplicates_removed": cleaning_report.duplicates_removed,
                "nulls_imputed": cleaning_report.nulls_imputed,
            },
            "kpis": kpis,
            "charts": charts,
            "forecast": forecast_res,
            "segmentation": seg_res,
            "anomalies": anomaly_res,
            "feature_importance": feature_res,
            "narrative": narrative_res,
        }
        
        # Filtro final anti-crashes (reemplaza NaN y Float infs por None para que fastapi jsonable_encoder no explote)
        final_response = clean_json_nans(final_response)
        
        return final_response

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Error durante el procesamiento: {str(ex)}")

