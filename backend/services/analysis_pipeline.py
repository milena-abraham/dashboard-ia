import csv
import json
import math
import time
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
        profile = profile_dataframe(df_clean)

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
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            fut_forecast, fut_feature, fut_anomaly, fut_segmentation = None, None, None, None
            
            if profile.date_columns and active_target in profile.numeric_columns:
                fut_forecast = executor.submit(run_forecast, df_ml, date_col=profile.date_columns[0], value_col=active_target, periods=60)
            
            if active_target in profile.numeric_columns:
                feats = [c for c in profile.numeric_columns if c != active_target]
                fut_feature = executor.submit(run_feature_importance, df_ml, active_target, feats, categorical_cols=profile.categorical_columns)
                
            fut_anomaly = executor.submit(
                run_anomaly_detection, df_ml, numeric_cols=profile.numeric_columns, 
                target_col=active_target if active_target in profile.numeric_columns else None, 
                date_col=profile.date_columns[0] if profile.date_columns else None
            )
            
            if len(profile.numeric_columns) >= 2:
                label_c = profile.categorical_columns[0] if profile.categorical_columns else None
                fut_segmentation = executor.submit(run_clustering, df_ml, numeric_cols=profile.numeric_columns[:6], label_col=label_c, target_col=active_target)
                
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

