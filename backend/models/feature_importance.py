"""
models/feature_importance.py
Importancia de variables con LightGBM + SHAP.
Retorna fig_json, shap_json y metricas.
"""

from __future__ import annotations
from typing import List, Tuple, Optional, Dict, Any
import pandas as pd
import numpy as np
import plotly.express as px

try:
    import lightgbm as lgb
    LGBM_AVAILABLE = True
except ImportError:
    LGBM_AVAILABLE = False

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


def run_feature_importance(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: List[str],
    categorical_cols: Optional[List[str]] = None,
) -> Tuple[Optional[str], Optional[str], dict]:
    """
    Calcula importancia de variables.
    Retorna (fig_importance_json, fig_shap_json, metrics)
    """
    if not LGBM_AVAILABLE:
        return None, None, {"error": "LightGBM no está disponible en este entorno."}

    if target_col not in df.columns:
        return None, None, {"error": f"Columna objetivo '{target_col}' no encontrada."}

    available = [c for c in feature_cols if c in df.columns and c != target_col]
    if not available:
        return None, None, {"error": "No hay columnas de variables predictoras disponibles."}

    try:
        df_ml = df[available + [target_col]].copy()
        cat_cols_present = [c for c in (categorical_cols or []) if c in available]
        for col in cat_cols_present:
            df_ml[col] = df_ml[col].astype("category").cat.codes

        df_ml = df_ml.fillna(df_ml.median(numeric_only=True))

        X = df_ml[available]
        y = df_ml[target_col]

        if len(X) < 10:
            return None, None, {"error": "Se requieren al menos 10 filas para análisis de factores."}

        model = lgb.LGBMRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            random_state=42,
            verbose=-1,
        )
        model.fit(X, y)

        importance_df = pd.DataFrame({
            "feature": available,
            "importance": model.feature_importances_,
        }).sort_values("importance", ascending=True).tail(15)

        fig_importance = px.bar(
            importance_df,
            x="importance",
            y="feature",
            orientation="h",
            title=f"Impacto de Variables en {target_col}",
            color="importance",
            color_continuous_scale=[[0, "#c3dafe"], [1, "#667eea"]],
        )
        fig_importance.update_layout(
            font_family="Inter, sans-serif",
            plot_bgcolor="white", paper_bgcolor="white",
            margin=dict(l=20, r=20, t=50, b=20),
            coloraxis_showscale=False,
        )

        fig_shap = None
        shap_summary = {}

        if SHAP_AVAILABLE:
            try:
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(X)
                mean_shap = np.abs(shap_values).mean(axis=0)

                shap_df = pd.DataFrame({
                    "feature": available,
                    "shap_importance": mean_shap,
                }).sort_values("shap_importance", ascending=True)

                fig_shap_obj = px.bar(
                    shap_df,
                    x="shap_importance",
                    y="feature",
                    orientation="h",
                    title=f"Impacto Real SHAP en {target_col}",
                    color="shap_importance",
                    color_continuous_scale=[[0, "#fefcbf"], [1, "#764ba2"]],
                )
                fig_shap_obj.update_layout(
                    font_family="Inter, sans-serif",
                    plot_bgcolor="white", paper_bgcolor="white",
                    margin=dict(l=20, r=20, t=50, b=20),
                    coloraxis_showscale=False,
                )
                fig_shap = fig_shap_obj.to_json()
                shap_summary = {feat: round(float(val), 4) for feat, val in zip(available, mean_shap)}
            except Exception:
                pass

        top_features = importance_df.tail(5)[["feature", "importance"]].iloc[::-1].to_dict(orient="records")

        metrics = {
            "top_features": top_features,
            "shap_summary": shap_summary,
            "n_features": len(available),
            "shap_disponible": bool(shap_summary),
        }

        return fig_importance.to_json(), fig_shap, metrics

    except Exception as e:
        return None, None, {"error": str(e)}
