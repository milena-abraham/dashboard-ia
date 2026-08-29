"""
models/segmentation.py
Segmentación de registros usando K-Means + PCA.
Retorna scatter_json, profile_json y métricas.
"""

from __future__ import annotations
from typing import Optional, Tuple, List, Dict, Any
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

PALETTE = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a", "#fee140"]

SEGMENT_LABELS = [
    "Segmento Estrella ⭐",
    "Segmento Activo 🟢",
    "Segmento Ocasional 🟡",
    "Segmento Dormido 🔴",
    "Segmento Nuevo 🆕",
    "Segmento Fiel 💙",
    "Segmento en Riesgo ⚠️",
]


def _find_optimal_k(X_scaled: np.ndarray, max_k: int = 6) -> int:
    if len(X_scaled) < max_k * 2:
        return min(3, max(2, len(X_scaled) // 2))

    best_k, best_score = 2, -1
    for k in range(2, min(max_k + 1, len(X_scaled))):
        try:
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = km.fit_predict(X_scaled)
            score = silhouette_score(X_scaled, labels)
            if score > best_score:
                best_score = score
                best_k = k
        except Exception:
            pass
    return best_k


def run_clustering(
    df: pd.DataFrame,
    numeric_cols: List[str],
    n_clusters: Optional[int] = None,
    label_col: Optional[str] = None,
) -> Tuple[pd.DataFrame, Optional[str], Optional[str], dict]:
    """
    Ejecuta K-Means y retorna (df_out, scatter_json, profile_json, metrics).
    """
    if len(numeric_cols) < 2:
        return df, None, None, {"error": "Se requieren al menos 2 columnas numéricas para clustering."}

    try:
        X = df[numeric_cols].copy()
        X = X.fillna(X.median())

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        k = n_clusters if n_clusters else _find_optimal_k(X_scaled)
        k = max(2, min(k, min(7, len(df) - 1)))

        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_scaled)

        df_out = df.copy()
        df_out["_cluster"] = labels
        df_out["_segment"] = df_out["_cluster"].apply(
            lambda x: SEGMENT_LABELS[x] if x < len(SEGMENT_LABELS) else f"Segmento {x+1}"
        )

        pca = PCA(n_components=2)
        components = pca.fit_transform(X_scaled)
        df_out["_pca1"] = components[:, 0]
        df_out["_pca2"] = components[:, 1]

        hover_data = [label_col] if label_col and label_col in df_out.columns else None

        fig_scatter = px.scatter(
            df_out, x="_pca1", y="_pca2", color="_segment",
            hover_data=hover_data,
            title=f"Mapa de Segmentos ({k} grupos)",
            color_discrete_sequence=PALETTE,
        )
        fig_scatter.update_traces(marker=dict(size=9, opacity=0.85))
        fig_scatter.update_layout(
            xaxis_title="Componente Principal 1",
            yaxis_title="Componente Principal 2",
            font_family="Inter, sans-serif",
            plot_bgcolor="white", paper_bgcolor="white",
            margin=dict(l=20, r=20, t=50, b=20),
        )

        profile_data = []
        for cluster_id in range(k):
            mask = df_out["_cluster"] == cluster_id
            seg_name = SEGMENT_LABELS[cluster_id] if cluster_id < len(SEGMENT_LABELS) else f"Segmento {cluster_id+1}"
            row = {"Segmento": seg_name, "Cantidad": int(mask.sum())}
            for col in numeric_cols:
                row[col] = round(float(df_out.loc[mask, col].mean()), 2)
            profile_data.append(row)

        df_profile = pd.DataFrame(profile_data)

        fig_profile = px.bar(
            df_profile.melt(id_vars=["Segmento", "Cantidad"], value_vars=numeric_cols),
            x="variable", y="value", color="Segmento",
            barmode="group",
            title="Perfil Promedio por Segmento",
            color_discrete_sequence=PALETTE,
        )
        fig_profile.update_layout(
            xaxis_title="Variable",
            yaxis_title="Promedio",
            font_family="Inter, sans-serif",
            plot_bgcolor="white", paper_bgcolor="white",
            margin=dict(l=20, r=20, t=50, b=20),
        )

        metrics = {
            "k": k,
            "varianza_explicada_pca": round(float(pca.explained_variance_ratio_.sum() * 100), 1),
            "distribucion": {
                SEGMENT_LABELS[i] if i < len(SEGMENT_LABELS) else f"Segmento {i+1}": int((labels == i).sum())
                for i in range(k)
            },
            "perfil": df_profile.to_dict(orient="records"),
        }

        return df_out, fig_scatter.to_json(), fig_profile.to_json(), metrics

    except Exception as e:
        return df, None, None, {"error": str(e)}
