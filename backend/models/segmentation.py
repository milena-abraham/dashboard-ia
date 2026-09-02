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
    "Segmento Estrella",
    "Segmento Activo",
    "Segmento Ocasional",
    "Segmento Dormido",
    "Segmento Nuevo",
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
        if len(X) < 10:
            return df, None, None, {"error": "Se requieren al menos 10 registros para segmentar."}
            
        # Remove zero variance columns to avoid scaling issues
        var = X.var()
        valid_cols = var[var > 0].index.tolist()
        if len(valid_cols) < 2:
            return df, None, None, {"error": "Las columnas numéricas no tienen suficiente varianza para segmentar."}
            
        X = X[valid_cols]
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

        source = df_plot[["_segment", "_pca1", "_pca2"]].copy()
        for c in source.columns:
            if c not in ["_segment", "_pca1", "_pca2"]:
                source = source.drop(columns=[c])
        
        scatter_data = {
            "chart_id": "seg_scatter",
            "metadata": {"title": "Distribución de Segmentos", "insight_subtitle": f"Agrupación por PCA en {k} clusters", "source_metric": "_segment"},
            "layout_directives": {"chart_type": "Scatter", "x_axis_type": "value", "y_axis_type": "value", "is_log_scale": False, "has_time_gaps": False, "high_cardinality": False, "show_confidence_bands": False},
            "dataset": {"dimensions": ["_pca1", "_pca2", "_segment"], "source": source.to_dict(orient="records")}
        }

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
        
        col_stats = {}
        source_radar = []
        for _, row in df_profile.iterrows():
            seg = row["Segmento"]
            d = {"_segment": seg}
            for c in numeric_cols:
                d[c] = row[c]
            source_radar.append(d)
            
        radar_data = {
            "chart_id": "seg_radar",
            "metadata": {"title": "Perfil de los Segmentos", "insight_subtitle": "Comparación de características", "source_metric": "_segment"},
            "layout_directives": {"chart_type": "Radar", "x_axis_type": "category", "y_axis_type": "value", "is_log_scale": False, "has_time_gaps": False, "high_cardinality": False, "show_confidence_bands": False},
            "dataset": {"dimensions": ["_segment"] + numeric_cols, "source": source_radar}
        }

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
