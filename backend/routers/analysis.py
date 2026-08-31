"""
routers/analysis.py
Endpoint principal de analisis de datasets.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
import pandas as pd
import io
import json
import asyncio
import hashlib
import time
import os
import shutil
import tempfile
import logging
import chardet
import csv
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
from insights.narrator import generate_narrative

router = APIRouter()

# Configuración de Logging Estructurado
logger = logging.getLogger("analysis_pipeline")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - [%(levelname)s] - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Límite máximo de archivo: 50 MB
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 50)) * 1024 * 1024

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
async def analyze(file: UploadFile = File(...), target_col: Optional[str] = Form(None)):
    t_start = time.time()
    
    # Validar tamaño del archivo (Rechazo temprano para proteger RAM)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        logger.error(f"Rechazo temprano: Archivo demasiado grande ({file_size} bytes)")
        raise HTTPException(status_code=413, detail=f"El archivo excede el límite máximo de {MAX_FILE_SIZE/(1024*1024):.1f}MB.")

    filename = file.filename or "dataset"
    t = str(target_col).lower() if target_col else "none"
    
    # Hash heurístico usando el nombre, el tamaño y los primeros 1MB para ser ultra rápidos
    chunk = await file.read(1024 * 1024)
    h = hashlib.sha256(chunk).hexdigest()
    file.file.seek(0)
    
    cache_key = f"{h}_{file_size}_{t}"
    if cache_key in ANALYSIS_CACHE:
        logger.info(f"CACHE HIT para {filename} en {time.time()-t_start:.2f}s")
        return ANALYSIS_CACHE[cache_key]

    logger.info(f"Iniciando procesamiento de {filename} ({file_size} bytes)")
    
    # Guardar en archivo temporal para que pandas pueda leerlo sin agotar la RAM
    fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
    try:
        with os.fdopen(fd, 'wb') as f:
            shutil.copyfileobj(file.file, f)
            
        # Pasar la ruta del archivo temporal en lugar de los bytes crudos
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
    """Detecta el encoding con chardet y el separador con csv.Sniffer para evitar fuerza bruta."""
    enc = 'utf-8'
    sep = None
    
    # 1. Detectar Encoding (leyendo solo los primeros 100KB)
    try:
        with open(file_path, 'rb') as f:
            raw = f.read(100000)
        res = chardet.detect(raw)
        if res and res['encoding']:
            enc = res['encoding']
    except Exception as e:
        logger.warning(f"Error detectando encoding, usando utf-8: {e}")

    # 2. Detectar Separador
    try:
        with open(file_path, 'r', encoding=enc, errors='ignore') as f:
            sample = f.read(4096)
        dialect = csv.Sniffer().sniff(sample)
        sep = dialect.delimiter
    except Exception as e:
        logger.warning(f"Error detectando separador con Sniffer: {e}")
        
    return enc, sep


def _analyze_sync(file_path: str, filename: str, target_col: Optional[str]):
    try:
        fname_lower = filename.lower()
        t_read = time.time()
        df_raw = None
        
        # 1. LECTURA Y DETECCIÓN INTELIGENTE (Streaming-like to disk)
        if fname_lower.endswith(".csv") or not fname_lower.endswith((".xlsx", ".xls")):
            enc, sep = detect_csv_format(file_path)
            logger.info(f"Detectado formato CSV: encoding='{enc}', separator='{sep}'")
            
            try:
                if sep:
                    # Usamos engine='c' que es más rápido que python
                    df_raw = pd.read_csv(file_path, encoding=enc, sep=sep, engine='c')
                else:
                    # Fallback si el sniffer falló
                    logger.warning("Sniffer no detectó separador. Usando fallback sep=None.")
                    df_raw = pd.read_csv(file_path, encoding=enc, sep=None, engine='python')
            except Exception as e:
                logger.error(f"Fallo la lectura optimizada ({str(e)}). Activando último recurso (latin1)...")
                df_raw = pd.read_csv(file_path, encoding="latin1", sep=None, engine="python")
        else:
            # Excel
            df_raw = pd.read_excel(file_path)

        if df_raw is None or df_raw.empty:
            raise HTTPException(status_code=400, detail="El archivo subido está vacío o corrupto.")

        logger.info(f"[Etapa 1] Archivo leído ({len(df_raw)} filas) en {time.time()-t_read:.2f}s")
        
        # 2. LIMPIEZA
        t_clean = time.time()
        df_clean, cleaning_report = clean_dataframe(df_raw)
        logger.info(f"[Etapa 2] Limpieza completada en {time.time()-t_clean:.2f}s")

        # 3. PROFILING
        t_prof = time.time()
        profile = profile_dataframe(df_clean)
        logger.info(f"[Etapa 3] Profiling completado en {time.time()-t_prof:.2f}s")

        # 4. TARGET COLUMN
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

        # 5. KPIs Y GRÁFICOS
        t_charts = time.time()
        kpis: Dict[str, Any] = {
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
        logger.info(f"[Etapa 4] Gráficos y KPIs listos en {time.time()-t_charts:.2f}s")

        # 6. MODELOS DE MACHINE LEARNING (PARALELIZADOS)
        t_ml = time.time()
        
        forecast_res: Dict[str, Any] = {"chart_data": None, "metrics": {}}
        feature_res: Dict[str, Any] = {"chart_importance": None, "chart_shap": None, "metrics": {}}
        anomaly_res: Dict[str, Any] = {"chart_data": None, "metrics": {}}
        seg_res: Dict[str, Any] = {"scatter_data": None, "radar_data": None, "metrics": {}}
        
        # Ejecutamos los 4 modelos de forma concurrente para ahorrar mucho tiempo
        # numpy y sklearn liberan el GIL en operaciones pesadas, así que ThreadPoolExecutor es ideal
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
                
            # Resolver futuros y capturar errores individuales sin romper el resto
            if fut_forecast:
                try:
                    _, f_fig, f_metrics = fut_forecast.result()
                    forecast_res = {"chart_data": f_fig, "metrics": f_metrics}
                except Exception as e:
                    logger.error(f"Error en Forecast: {e}")
                    forecast_res["metrics"] = {"error": str(e)}
                    
            if fut_feature:
                try:
                    fi_fig, shap_fig, fi_metrics = fut_feature.result()
                    feature_res = {"chart_importance": fi_fig, "chart_shap": shap_fig, "metrics": fi_metrics}
                except Exception as e:
                    logger.error(f"Error en Feature Importance: {e}")
                    feature_res["metrics"] = {"error": str(e)}
                    
            if fut_anomaly:
                try:
                    _, a_fig, a_metrics = fut_anomaly.result()
                    anomaly_res = {"chart_data": a_fig, "metrics": a_metrics}
                except Exception as e:
                    logger.error(f"Error en Anomalies: {e}")
                    anomaly_res["metrics"] = {"error": str(e)}
                    
            if fut_segmentation:
                try:
                    _, s_scatter, s_prof, s_metrics = fut_segmentation.result()
                    seg_res = {"scatter_data": s_scatter, "radar_data": s_prof, "metrics": s_metrics}
                except Exception as e:
                    logger.error(f"Error en Segmentation: {e}")
                    seg_res["metrics"] = {"error": str(e)}

        logger.info(f"[Etapa 5] Machine Learning (Paralelizado) completado en {time.time()-t_ml:.2f}s")

        # 7. NARRATIVA IA (Moviendo a endpoint asíncrono)
        logger.info(f"[Etapa 6] Narrativa IA delegada a endpoint secundario para no bloquear UI")
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

    except HTTPException:
        raise
    except Exception as ex:
        logger.error(f"Error fatal interno: {str(ex)}")
        raise HTTPException(status_code=500, detail=f"Error durante el procesamiento: {str(ex)}")

