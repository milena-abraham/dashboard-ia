"""
routers/analysis.py
Endpoint principal de analisis de datasets.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
import pandas as pd
import io
import json

from core.data_cleaner import clean_dataframe
from core.data_profiler import profile_dataframe
from core.chart_generator import auto_charts
from models.forecaster import run_forecast
from models.segmentation import run_clustering
from models.anomaly_detector import run_anomaly_detection
from models.feature_importance import run_feature_importance
from insights.narrator import generate_narrative

router = APIRouter()


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
    file: UploadFile = File(...),
    target_col: Optional[str] = Form(None),
):
    try:
        contents = await file.read()
        filename = file.filename or "dataset"
        fname_lower = filename.lower()

        # 1. Leer archivo
        if fname_lower.endswith(".csv"):
            df_raw = None
            for sep in [",", ";", "\t", "|"]:
                try:
                    df_test = pd.read_csv(io.BytesIO(contents), sep=sep)
                    if len(df_test.columns) > 1:
                        df_raw = df_test
                        break
                except Exception:
                    continue
            if df_raw is None:
                df_raw = pd.read_csv(io.BytesIO(contents))
        elif fname_lower.endswith((".xlsx", ".xls")):
            df_raw = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Formato de archivo no soportado. Debe ser .csv, .xlsx o .xls")

        if df_raw.empty:
            raise HTTPException(status_code=400, detail="El archivo subido está vacío.")

        # 2. Limpieza
        df_clean, cleaning_report = clean_dataframe(df_raw)

        # 3. Profiler
        profile = profile_dataframe(df_clean)

        # 4. Determinar target_col
        active_target = target_col
        if not active_target or active_target not in profile.numeric_columns:
            if profile.suggested_targets:
                active_target = profile.suggested_targets[0]
            elif profile.numeric_columns:
                active_target = profile.numeric_columns[0]
            else:
                active_target = df_clean.columns[0]

        # 5. KPIs
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

        # 6. Gráficos automáticos
        charts = auto_charts(df_clean, profile, active_target)

        # 7. Forecast
        forecast_res: Dict[str, Any] = {"fig_json": None, "metrics": {}}
        if profile.date_columns and active_target in profile.numeric_columns:
            try:
                _, f_fig, f_metrics = run_forecast(df_clean, date_col=profile.date_columns[0], value_col=active_target, periods=60)
                forecast_res = {"fig_json": f_fig, "metrics": f_metrics}
            except Exception as e:
                forecast_res["metrics"] = {"error": str(e)}

        # 8. Importancia de Variables
        feature_res: Dict[str, Any] = {"fig_json": None, "shap_json": None, "metrics": {}}
        if active_target in profile.numeric_columns:
            try:
                feats = [c for c in profile.numeric_columns if c != active_target]
                fi_fig, shap_fig, fi_metrics = run_feature_importance(df_clean, active_target, feats, categorical_cols=profile.categorical_columns)
                feature_res = {"fig_json": fi_fig, "shap_json": shap_fig, "metrics": fi_metrics}
            except Exception as e:
                feature_res["metrics"] = {"error": str(e)}

        # 9. Detección de Anomalías
        anomaly_res: Dict[str, Any] = {"fig_json": None, "metrics": {}}
        try:
            _, a_fig, a_metrics = run_anomaly_detection(
                df_clean,
                numeric_cols=profile.numeric_columns,
                target_col=active_target if active_target in profile.numeric_columns else None,
                date_col=profile.date_columns[0] if profile.date_columns else None,
            )
            anomaly_res = {"fig_json": a_fig, "metrics": a_metrics}
        except Exception as e:
            anomaly_res["metrics"] = {"error": str(e)}

        # 10. Segmentación
        seg_res: Dict[str, Any] = {"scatter_json": None, "profile_json": None, "metrics": {}}
        if len(profile.numeric_columns) >= 2:
            try:
                label_c = profile.categorical_columns[0] if profile.categorical_columns else None
                _, s_scatter, s_prof, s_metrics = run_clustering(df_clean, numeric_cols=profile.numeric_columns[:6], label_col=label_c)
                seg_res = {"scatter_json": s_scatter, "profile_json": s_prof, "metrics": s_metrics}
            except Exception as e:
                seg_res["metrics"] = {"error": str(e)}

        # 11. Narrativa IA
        narrative_res = generate_narrative(
            df=df_clean,
            profile=profile,
            target_col=active_target,
            kpis=kpis,
            anomaly_metrics=anomaly_res.get("metrics", {}),
            forecast_metrics=forecast_res.get("metrics", {}),
            segmentation_metrics=seg_res.get("metrics", {}),
            feature_metrics=feature_res.get("metrics", {}),
            filename=filename,
        )

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
        raise HTTPException(status_code=500, detail=f"Error durante el procesamiento: {str(ex)}")
