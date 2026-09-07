import csv
import json
import math
import time
import os
import gc
from collections import defaultdict, Counter
import pandas as pd
import numpy as np
import chardet
from typing import Optional, Dict, Any
from fastapi import HTTPException, Response
from concurrent.futures import ThreadPoolExecutor

from core.data_cleaner import clean_dataframe
from core.data_profiler import profile_dataframe
from core.chart_generator import auto_charts
from models.forecaster import run_forecast
from models.feature_importance import run_feature_importance
from models.anomaly_detector import run_anomaly_detection
from models.segmentation import run_clustering
from core.logging import logger

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'model_dump') and callable(getattr(obj, 'model_dump')):
            return obj.model_dump()
        if hasattr(obj, 'dict') and callable(getattr(obj, 'dict')):
            return obj.dict()
        if hasattr(obj, '__dict__') and not isinstance(obj, type):
            return vars(obj)
        if isinstance(obj, (pd.Series, pd.Index, np.ndarray)):
            return obj.tolist()
        if isinstance(obj, (float, np.floating)):
            if math.isnan(obj) or math.isinf(obj) or pd.isna(obj):
                return None
            return float(obj)
        if isinstance(obj, (int, np.integer)):
            return int(obj)
        if isinstance(obj, (bool, np.bool_)):
            return bool(obj)
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        if isinstance(obj, (np.datetime64, np.timedelta64)):
            return str(obj)
        return super(NumpyEncoder, self).default(obj)

def clean_json_nans(obj):
    if hasattr(obj, "model_dump") and callable(getattr(obj, "model_dump")):
        try:
            obj = obj.model_dump()
        except:
            pass
    elif hasattr(obj, "dict") and callable(getattr(obj, "dict")):
        try:
            obj = obj.dict()
        except:
            pass
    if isinstance(obj, dict):
        return {k: clean_json_nans(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_json_nans(i) for i in obj]
    elif isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj

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
        return f"{prefix}{n}"
    return str(n)

def detect_csv_format(file_path: str):
    enc = 'utf-8'
    sep = ','
    try:
        with open(file_path, 'rb') as f:
            raw = f.read(100000)
        res = chardet.detect(raw)
        if res and res['encoding']:
            enc = res['encoding']

        # Fast separator detection for C-engine optimization
        sample_text = raw.decode(enc, errors='ignore')
        lines = [line for line in sample_text.splitlines()[:10] if line.strip()]
        if lines:
            header = lines[0]
            counts = {
                ',': header.count(','),
                ';': header.count(';'),
                '\t': header.count('\t'),
                '|': header.count('|')
            }
            best_sep = max(counts, key=counts.get)
            if counts[best_sep] > 0:
                sep = best_sep
            else:
                try:
                    dialect = csv.Sniffer().sniff(sample_text[:4096])
                    sep = dialect.delimiter
                except Exception:
                    sep = ','
    except Exception as e:
        logger.warning(f"Error detectando encoding/delimitador, usando utf-8 y ',': {e}")
    return enc, sep

def _parse_json_intelligent(file_path: str):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, list):
            df = pd.json_normalize(data)
            return df
        elif isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                    return pd.json_normalize(v)
            return pd.json_normalize([data])
        else:
            return pd.DataFrame([data])
    except Exception as e:
        logger.error(f"Error parsing JSON: {e}")
        return pd.DataFrame()

def _analyze_streaming_csv(file_path: str, filename: str, target_col: Optional[str], enc: str, sep: str):
    logger.info(f"[Modo Streaming] Archivo grande detectado ({filename}). Activando procesamiento en bloques.")
    t_start = time.time()
    
    # 1. Preview chunk para inferir estructura y tipos
    try:
        df_preview = pd.read_csv(file_path, encoding=enc, sep=sep, nrows=2500, engine='c', on_bad_lines='skip')
    except Exception:
        df_preview = pd.read_csv(file_path, encoding=enc, sep=None, nrows=2500, engine='python')
        
    df_clean_preview, preview_report = clean_dataframe(df_preview)
    preview_profile = profile_dataframe(df_clean_preview, duplicate_rows=0)
    
    # 2. Determinar columna objetivo
    active_target = None
    if target_col:
        target_clean = str(target_col).strip().lower()
        for col in preview_profile.numeric_columns:
            if str(col).strip().lower() == target_clean:
                active_target = col
                break
        if not active_target:
            for col in df_clean_preview.columns:
                if str(col).strip().lower() == target_clean:
                    active_target = col
                    break
                    
    if not active_target:
        if preview_profile.suggested_targets:
            active_target = preview_profile.suggested_targets[0]
        elif preview_profile.numeric_columns:
            active_target = preview_profile.numeric_columns[0]
        else:
            active_target = df_clean_preview.columns[0]
            
    # 3. Estimar tamaño y fracción de muestreo uniforme para ML (objetivo: ~10.000 filas para alta fidelidad y mínimo consumo de RAM)
    file_size = os.path.getsize(file_path)
    avg_row_bytes = max(20.0, len(df_preview.to_csv(index=False).encode('utf-8')) / max(1, len(df_preview)))
    est_total_rows = max(len(df_preview), int(file_size / avg_row_bytes))
    sample_frac = min(1.0, 15000.0 / max(10000.0, float(est_total_rows)))
    
    # 4. Acumuladores de agregación global (100% de los datos)
    total_rows = 0
    col_sums: Dict[str, float] = defaultdict(float)
    col_mins: Dict[str, float] = {}
    col_maxs: Dict[str, float] = {}
    col_counts: Dict[str, int] = defaultdict(int)
    cat_freqs: Dict[str, Counter] = defaultdict(Counter)
    
    samples = []
    CHUNK_SIZE = 40000
    
    for chunk in pd.read_csv(file_path, encoding=enc, sep=sep, chunksize=CHUNK_SIZE, engine='c', on_bad_lines='skip'):
        # Downcast numérico en el chunk para mínimo consumo de RAM
        for c in chunk.columns:
            if pd.api.types.is_float_dtype(chunk[c]):
                chunk[c] = pd.to_numeric(chunk[c], downcast='float')
            elif pd.api.types.is_integer_dtype(chunk[c]):
                chunk[c] = pd.to_numeric(chunk[c], downcast='integer')
                
        chunk_len = len(chunk)
        total_rows += chunk_len
        
        # Acumular numéricas exactas sobre el 100% de los datos
        for col in preview_profile.numeric_columns:
            if col in chunk.columns:
                s = chunk[col].dropna()
                if not s.empty:
                    col_sums[col] += float(s.sum())
                    col_counts[col] += len(s)
                    cmin = float(s.min())
                    cmax = float(s.max())
                    col_mins[col] = min(col_mins.get(col, cmin), cmin)
                    col_maxs[col] = max(col_maxs.get(col, cmax), cmax)
                    
        # Acumular frecuencias de categorías principales sobre el 100% de los datos
        for col in preview_profile.categorical_columns[:3]:
            if col in chunk.columns:
                vc = chunk[col].value_counts().head(20).to_dict()
                cat_freqs[col].update(vc)
                
        # Muestreo uniforme de alta fidelidad
        if sample_frac < 1.0:
            samples.append(chunk.sample(frac=sample_frac, random_state=42))
        else:
            samples.append(chunk)
            
    # Consolidar muestra de ML calibrada a 10.000 filas
    if samples:
        df_clean = pd.concat(samples, ignore_index=True)
        if len(df_clean) > 10000:
            df_ml = df_clean.sample(10000, random_state=42)
        else:
            df_ml = df_clean
    else:
        df_clean = df_clean_preview
        df_ml = df_clean_preview
        
    del samples
    gc.collect()
    
    # 5. KPIs exactos con 100% de los datos
    kpis = {
        "Registros": f"{total_rows:,}",
        "Columnas": preview_profile.n_cols,
    }
    if active_target in col_sums and col_counts.get(active_target, 0) > 0:
        kpis["Total"] = format_number(col_sums[active_target])
        kpis["Promedio"] = format_number(col_sums[active_target] / col_counts[active_target])
        kpis["Máximo"] = format_number(col_maxs.get(active_target, 0))
        kpis["Mínimo"] = format_number(col_mins.get(active_target, 0))
    elif preview_profile.numeric_columns and preview_profile.numeric_columns[0] in col_sums:
        fallback_col = preview_profile.numeric_columns[0]
        kpis["Total"] = format_number(col_sums[fallback_col])
        kpis["Promedio"] = format_number(col_sums[fallback_col] / max(col_counts[fallback_col], 1))
        kpis["Máximo"] = format_number(col_maxs.get(fallback_col, 0))
        kpis["Mínimo"] = format_number(col_mins.get(fallback_col, 0))
        
    # Actualizar total de filas en el profile
    profile = preview_profile
    profile.n_rows = total_rows
    
    # Gráficos sobre muestra de alta fidelidad
    charts = auto_charts(df_clean, profile, active_target)
    
    # Inyectar las frecuencias globales del 100% de los datos en los gráficos de categorías
    for chart in charts:
        c_title = (chart.get("title") or "").lower()
        for cat_col, freqs in cat_freqs.items():
            if cat_col.lower() in c_title and chart.get("chart_data"):
                cd = chart["chart_data"]
                if cd.get("type") in ("bar_horizontal", "doughnut", "bar"):
                    top_items = freqs.most_common(10)
                    cd["labels"] = [k for k, _ in top_items]
                    if cd.get("datasets") and len(cd["datasets"]) > 0:
                        cd["datasets"][0]["data"] = [v for _, v in top_items]
                        
    # 6. Modelos de ML ejecutados de manera secuencial para proteger los 512 MB de RAM en Render
    forecast_res = {"chart_data": None, "metrics": {}}
    feature_res = {"chart_importance": None, "chart_shap": None, "metrics": {}}
    anomaly_res = {"chart_data": None, "metrics": {}}
    seg_res = {"scatter_data": None, "radar_data": None, "metrics": {}}

    # 6.1 Forecast
    if profile.date_columns and active_target in profile.numeric_columns:
        try:
            _, f_fig, f_metrics = run_forecast(df_clean, date_col=profile.date_columns[0], value_col=active_target, periods=60)
            forecast_res = {"chart_data": f_fig, "metrics": f_metrics}
        except Exception as e:
            forecast_res["metrics"] = {"error": str(e)}
    gc.collect()

    # 6.2 Feature Importance
    if active_target in profile.numeric_columns:
        feats = [c for c in profile.numeric_columns if c != active_target]
        try:
            fi_fig, shap_fig, fi_metrics = run_feature_importance(df_ml, active_target, feats, categorical_cols=profile.categorical_columns)
            feature_res = {"chart_importance": fi_fig, "chart_shap": shap_fig, "metrics": fi_metrics}
        except Exception as e:
            feature_res["metrics"] = {"error": str(e)}
    gc.collect()

    # 6.3 Anomalías
    try:
        _, a_fig, a_metrics = run_anomaly_detection(
            df_ml, numeric_cols=profile.numeric_columns, 
            target_col=active_target if active_target in profile.numeric_columns else None, 
            date_col=profile.date_columns[0] if profile.date_columns else None
        )
        anomaly_res = {"chart_data": a_fig, "metrics": a_metrics}
    except Exception as e:
        anomaly_res["metrics"] = {"error": str(e)}
    gc.collect()

    # 6.4 Segmentación
    if len(profile.numeric_columns) >= 2:
        label_c = profile.categorical_columns[0] if profile.categorical_columns else None
        try:
            _, s_dist, s_prof, s_metrics = run_clustering(
                df_ml, numeric_cols=profile.numeric_columns[:6], label_col=label_c, target_col=active_target
            )
            seg_res = {"scatter_data": s_dist, "radar_data": s_prof, "metrics": s_metrics}
        except Exception as e:
            seg_res["metrics"] = {"error": str(e)}
    gc.collect()

    narrative_res = {
        "text": "Generando informe avanzado con IA...",
        "source": "pending"
    }

    cleaning_actions = preview_report.actions
    cleaning_actions.append(f"[Streaming] Procesamiento activado: {total_rows:,} registros consolidados al 100% de exactitud.")

    final_response = {
        "filename": filename,
        "target_col": active_target,
        "profile": {
            "n_rows": total_rows,
            "n_cols": profile.n_cols,
            "quality_score": profile.quality_score,
            "quality_label": profile.quality_label,
            "numeric_columns": profile.numeric_columns,
            "date_columns": profile.date_columns,
            "categorical_columns": profile.categorical_columns,
            "suggested_targets": profile.suggested_targets,
        },
        "cleaning_report": {
            "actions": cleaning_actions,
            "duplicates_removed": preview_report.duplicates_removed,
            "nulls_imputed": preview_report.nulls_imputed,
        },
        "kpis": kpis,
        "charts": charts,
        "forecast": forecast_res,
        "segmentation": seg_res,
        "anomalies": anomaly_res,
        "feature_importance": feature_res,
        "narrative": narrative_res,
    }
    
    json_str = json.dumps(final_response, cls=NumpyEncoder)
    result_dict = json.loads(json_str)
    
    del df_clean, df_ml, df_preview, df_clean_preview
    gc.collect()
    
    logger.info(f"[Modo Streaming] Finalizado análisis de {total_rows:,} filas en {time.time()-t_start:.2f}s")
    return result_dict

def _analyze_sync(file_path: str, filename: str, target_col: Optional[str]):
    try:
        fname_lower = filename.lower()
        t_read = time.time()
        df_raw = None
        
        if fname_lower.endswith(".json"):
            df_raw = _parse_json_intelligent(file_path)
        elif fname_lower.endswith(".csv") or not fname_lower.endswith((".xlsx", ".xls")):
            enc, sep = detect_csv_format(file_path)
            # Archivos grandes (>15MB) se procesan automáticamente en modo streaming por bloques
            if os.path.exists(file_path) and os.path.getsize(file_path) > 15 * 1024 * 1024:
                return _analyze_streaming_csv(file_path, filename, target_col, enc, sep)
            try:
                df_raw = pd.read_csv(file_path, encoding=enc, sep=sep, engine='c', on_bad_lines='skip')
            except Exception as e:
                logger.warning(f"Fallo lectura rapida C-engine con sep='{sep}': {e}. Probando engine='python'")
                try:
                    df_raw = pd.read_csv(file_path, encoding=enc, sep=None, engine='python')
                except Exception:
                    df_raw = pd.read_csv(file_path, encoding="latin1", sep=None, engine="python")
        else:
            df_raw = pd.read_excel(file_path)

        if df_raw is None or df_raw.empty:
            raise HTTPException(status_code=400, detail="El archivo subido está vacío o no es tabular.")

        logger.info(f"[Etapa 1] Archivo leído ({len(df_raw)} filas) en {time.time()-t_read:.2f}s")
        
        t_clean = time.time()
        df_clean, cleaning_report = clean_dataframe(df_raw)
        
        t_prof = time.time()
        # Pasamos duplicate_rows=0 porque clean_dataframe ya eliminó duplicados
        profile = profile_dataframe(df_clean, duplicate_rows=0)

        # Para modelos de ML intensivos (Clustering, Anomalías, LightGBM), si el dataset supera 10,000 filas,
        # usamos una muestra representativa de 10k filas para responder en ~1-2 segundos con mínimo consumo de RAM.
        # df_clean se preserva 100% íntegro para KPIs, conteos, profiling, gráficos y series temporales completas.
        if len(df_clean) > 10000:
            df_ml = df_clean.sample(10000, random_state=42)
        else:
            df_ml = df_clean

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
        
        # Ejecución secuencial con liberación de memoria entre modelos
        if profile.date_columns and active_target in profile.numeric_columns:
            try:
                _, f_fig, f_metrics = run_forecast(df_clean, date_col=profile.date_columns[0], value_col=active_target, periods=60)
                forecast_res = {"chart_data": f_fig, "metrics": f_metrics}
            except Exception as e:
                forecast_res["metrics"] = {"error": str(e)}
        gc.collect()
        
        if active_target in profile.numeric_columns:
            feats = [c for c in profile.numeric_columns if c != active_target]
            try:
                fi_fig, shap_fig, fi_metrics = run_feature_importance(df_ml, active_target, feats, categorical_cols=profile.categorical_columns)
                feature_res = {"chart_importance": fi_fig, "chart_shap": shap_fig, "metrics": fi_metrics}
            except Exception as e:
                feature_res["metrics"] = {"error": str(e)}
        gc.collect()
            
        try:
            _, a_fig, a_metrics = run_anomaly_detection(
                df_ml, numeric_cols=profile.numeric_columns, 
                target_col=active_target if active_target in profile.numeric_columns else None, 
                date_col=profile.date_columns[0] if profile.date_columns else None
            )
            anomaly_res = {"chart_data": a_fig, "metrics": a_metrics}
        except Exception as e:
            anomaly_res["metrics"] = {"error": str(e)}
        gc.collect()
            
        if len(profile.numeric_columns) >= 2:
            label_c = profile.categorical_columns[0] if profile.categorical_columns else None
            try:
                _, s_scatter, s_prof, s_metrics = run_clustering(
                    df_ml, numeric_cols=profile.numeric_columns[:6], label_col=label_c, target_col=active_target
                )
                seg_res = {"scatter_data": s_scatter, "radar_data": s_prof, "metrics": s_metrics}
            except Exception as e:
                seg_res["metrics"] = {"error": str(e)}
        gc.collect()

        narrative_res = {
            "text": "Generando informe avanzado con IA...",
            "source": "pending"
        }

        final_response = {
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
        
        # Use NumpyEncoder to sanitize all nested numpy types into native Python types
        json_str = json.dumps(final_response, cls=NumpyEncoder)
        return json.loads(json_str)

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Error durante el procesamiento: {str(ex)}")

