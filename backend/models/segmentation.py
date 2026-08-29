"""
models/segmentation.py
Segmentación de registros usando K-Means + PCA.
Retorna raw data para renderizar con Chart.js en el frontend.
"""

from __future__ import annotations
from typing import Optional, Tuple, List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

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

    X_sample = X_scaled[np.random.choice(X_scaled.shape[0], min(10000, len(X_scaled)), replace=False)]

    best_k, best_score = 2, -1
    for k in range(2, min(max_k + 1, len(X_sample))):
        try:
            km = KMeans(n_clusters=k, random_state=42, n_init="auto")
            labels = km.fit_predict(X_sample)
            score = silhouette_score(X_sample, labels, sample_size=min(3000, len(X_sample)), random_state=42)
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
) -> Tuple[pd.DataFrame, Optional[dict], Optional[dict], dict]:
    """
    Ejecuta K-Means y retorna (df_out, scatter_data, profile_data, metrics).
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

        km = KMeans(n_clusters=k, random_state=42, n_init="auto")
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

        if len(df_out) > 3000:
            df_plot = df_out.groupby("_segment").sample(frac=3000/len(df_out), random_state=42)
        else:
            df_plot = df_out

        # Preparar data de scatter para Chart.js
        scatter_data = {
            "type": "scatter",
            "segments": {}
        }
        
        for segment in df_plot["_segment"].unique():
            seg_df = df_plot[df_plot["_segment"] == segment]
            scatter_data["segments"][segment] = {
                "x": seg_df["_pca1"].tolist(),
                "y": seg_df["_pca2"].tolist(),
            }
            if label_col and label_col in seg_df.columns:
                scatter_data["segments"][segment]["labels"] = seg_df[label_col].tolist()

        # Preparar data de perfil para Radar/Bar Chart.js
        profile_data = []
        for cluster_id in range(k):
            mask = df_out["_cluster"] == cluster_id
            seg_name = SEGMENT_LABELS[cluster_id] if cluster_id < len(SEGMENT_LABELS) else f"Segmento {cluster_id+1}"
            row = {"Segmento": seg_name, "Cantidad": int(mask.sum())}
            for col in numeric_cols:
                row[col] = round(float(df_out.loc[mask, col].mean()), 2)
            profile_data.append(row)

        df_profile = pd.DataFrame(profile_data)
        
        radar_data = {
            "type": "radar",
            "metrics": numeric_cols,
            "datasets": {}
        }
        for _, row in df_profile.iterrows():
            seg = row["Segmento"]
            radar_data["datasets"][seg] = [row[c] for c in numeric_cols]

        metrics = {
            "k": k,
            "varianza_explicada_pca": round(float(pca.explained_variance_ratio_.sum() * 100), 1),
            "distribucion": {
                SEGMENT_LABELS[i] if i < len(SEGMENT_LABELS) else f"Segmento {i+1}": int((labels == i).sum())
                for i in range(k)
            },
            "perfil": df_profile.to_dict(orient="records"),
        }

        return df_out, scatter_data, radar_data, metrics

    except Exception as e:
        return df, None, None, {"error": str(e)}
