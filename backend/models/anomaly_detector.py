"""
models/anomaly_detector.py
Deteccion de anomalias con Isolation Forest para Web API.
Retorna fig_json y metricas.
"""

from __future__ import annotations
from typing import List, Tuple, Optional, Dict, Any
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def run_anomaly_detection(
    df: pd.DataFrame,
    numeric_cols: List[str],
    target_col: Optional[str] = None,
    date_col: Optional[str] = None,
    contamination: float = 0.05,
) -> Tuple[pd.DataFrame, Optional[str], dict]:
    """
    Detecta anomalias usando Isolation Forest.
    Retorna (df_out, fig_json, metrics)
    """
    if not numeric_cols:
        return df, None, {"error": "No hay columnas numéricas para analizar."}

    try:
        X = df[numeric_cols].copy().fillna(df[numeric_cols].median())
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        iso = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42,
        )
        labels = iso.fit_predict(X_scaled)

        df_out = df.copy()
        df_out["_is_anomaly"] = labels == -1
        n_anomalies = int((labels == -1).sum())
        anomaly_rows = df_out[df_out["_is_anomaly"]].copy()

        fig = None
        if target_col and target_col in df_out.columns and date_col and date_col in df_out.columns:
            df_plot = df_out.copy()
            df_plot[date_col] = pd.to_datetime(df_plot[date_col], errors="coerce")
            df_agg = df_plot.groupby([date_col, "_is_anomaly"])[target_col].sum().reset_index()

            normal_df = df_agg[~df_agg["_is_anomaly"]]
            anomaly_df = df_agg[df_agg["_is_anomaly"]]

            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=normal_df[date_col], y=normal_df[target_col],
                mode="lines+markers", name="Normal",
                line=dict(color="#667eea", width=2),
                marker=dict(size=5),
            ))
            fig.add_trace(go.Scatter(
                x=anomaly_df[date_col], y=anomaly_df[target_col],
                mode="markers", name="⚠️ Anomalía",
                marker=dict(color="#e53e3e", size=12, symbol="x"),
            ))
            fig.update_layout(
                title=f"Anomalías Detectadas en {target_col}",
                xaxis_title="Fecha", yaxis_title=target_col,
                font_family="Inter, sans-serif",
                plot_bgcolor="white", paper_bgcolor="white",
                margin=dict(l=20, r=20, t=50, b=20),
            )
        elif target_col and target_col in df_out.columns:
            fig = px.scatter(
                df_out, x=df_out.index, y=target_col,
                color="_is_anomaly",
                color_discrete_map={True: "#e53e3e", False: "#667eea"},
                title=f"Anomalías detectadas en {target_col}",
                labels={"_is_anomaly": "¿Anomalía?"},
            )
            fig.update_layout(
                font_family="Inter, sans-serif",
                plot_bgcolor="white", paper_bgcolor="white",
                margin=dict(l=20, r=20, t=50, b=20),
            )

        anomaly_descriptions = []
        if not anomaly_rows.empty:
            for _, row in anomaly_rows.head(10).iterrows():
                desc_parts = []
                if date_col and date_col in row:
                    desc_parts.append(str(row[date_col])[:10])
                for col in numeric_cols[:3]:
                    if col in row:
                        desc_parts.append(f"{col}: {round(float(row[col]), 2)}")
                anomaly_descriptions.append(" | ".join(desc_parts))

        metrics = {
            "n_anomalias": n_anomalies,
            "pct_anomalias": round(n_anomalies / max(len(df), 1) * 100, 1),
            "anomalias_detalle": anomaly_descriptions,
        }

        return df_out, fig.to_json() if fig else None, metrics

    except Exception as e:
        return df, None, {"error": str(e)}
