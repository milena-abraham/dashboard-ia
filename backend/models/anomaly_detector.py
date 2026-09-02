"""
models/anomaly_detector.py
Deteccion de anomalias con Isolation Forest para Web API.
Retorna raw data y metricas.
"""

from __future__ import annotations
from typing import List, Tuple, Optional, Dict, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def run_anomaly_detection(
    df: pd.DataFrame,
    numeric_cols: List[str],
    target_col: Optional[str] = None,
    date_col: Optional[str] = None,
    contamination: float = 0.01,
) -> Tuple[pd.DataFrame, Optional[dict], dict]:
    """
    Detecta anomalias usando Isolation Forest.
    Retorna (df_out, chart_data, metrics)
    """
    if not numeric_cols:
        return df, None, {"error": "No hay columnas numéricas para analizar."}

    try:
        if len(df) < 10:
            return df, None, {"error": "Se requieren al menos 10 registros para detectar anomalías con precisión."}

        X = df[numeric_cols].copy().fillna(df[numeric_cols].median())
        var = X.var()
        valid_cols = var[var > 0].index.tolist()
        if not valid_cols:
            return df, None, {"error": "Las columnas numéricas no tienen varianza para analizar anomalías."}
            
        X = X[valid_cols]
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Dynamic contamination: cap at ~150 anomalies to prevent chart smearing and noise, 
        # but keep it between 0.1% and 5%
        dynamic_contamination = min(0.05, max(0.001, 150 / len(X_scaled)))
        
        iso = IsolationForest(
            n_estimators=100,
            contamination=dynamic_contamination,
            random_state=42,
        )
        labels = iso.fit_predict(X_scaled)

        df_out = df.copy()
        df_out["_is_anomaly"] = labels == -1
        n_anomalies = int((labels == -1).sum())
        anomaly_rows = df_out[df_out["_is_anomaly"]].copy()

        chart_data = None
        if target_col and target_col in df_out.columns and date_col and date_col in df_out.columns:
            df_plot = df_out.copy()
            df_plot[date_col] = pd.to_datetime(df_plot[date_col], errors="coerce")
            
            # Remove NaNs in target or date
            df_plot = df_plot.dropna(subset=[date_col, target_col])

            normal_df = df_plot[~df_plot["_is_anomaly"]]
            anomaly_df = df_plot[df_plot["_is_anomaly"]]

            # Downsample normal points for frontend performance
            if len(normal_df) > 1500:
                normal_df = normal_df.sample(1500, random_state=42)
                
            # Limit anomalies to prevent massive payload if contamination is high
            if len(anomaly_df) > 500:
                anomaly_df = anomaly_df.sample(500, random_state=42)
                
            # Sort by date
            normal_df = normal_df.sort_values(by=date_col)
            anomaly_df = anomaly_df.sort_values(by=date_col)

            import pandas as pd
            df_plot = pd.concat([normal_df, anomaly_df])
            df_plot["_anomaly"] = df_plot["_is_anomaly"].map({True: -1, False: 1})
            df_plot[date_col] = df_plot[date_col].dt.strftime('%Y-%m-%d %H:%M')
            
            source = df_plot[[date_col, target_col, "_anomaly"]].copy().to_dict(orient="records")
            
            chart_data = {
                "chart_id": "anom_time",
                "metadata": {"title": "Detección de Anomalías", "insight_subtitle": f"Sobre la serie temporal de {target_col}", "source_metric": target_col},
                "layout_directives": {"chart_type": "Scatter", "x_axis_type": "category", "y_axis_type": "value", "is_log_scale": False, "has_time_gaps": False, "high_cardinality": False, "show_confidence_bands": False},
                "dataset": {"dimensions": [date_col, target_col, "_anomaly"], "source": source}
            }

        elif len(numeric_cols) >= 2:
            x_col = numeric_cols[0]
            y_col = numeric_cols[1]
            
            # Split anomalies and normal
            df_anomalies = df_out[df_out["_is_anomaly"]]
            df_normal = df_out[~df_out["_is_anomaly"]]
            
            # Downsample only normal points if needed
            if len(df_normal) > 3000:
                df_normal = df_normal.sample(3000, random_state=42)

            def to_list_clean(series):
                return [x if not pd.isna(x) else None for x in series]

            import pandas as pd
            df_plot = pd.concat([df_normal, df_anomalies])
            df_plot["_anomaly"] = df_plot["_is_anomaly"].map({True: -1, False: 1})
            
            source = df_plot[[x_col, y_col, "_anomaly"]].copy().to_dict(orient="records")
            
            chart_data = {
                "chart_id": "anom_scatter",
                "metadata": {"title": "Detección de Anomalías", "insight_subtitle": f"Dispersión {x_col} vs {y_col}", "source_metric": y_col},
                "layout_directives": {"chart_type": "Scatter", "x_axis_type": "value", "y_axis_type": "value", "is_log_scale": False, "has_time_gaps": False, "high_cardinality": False, "show_confidence_bands": False},
                "dataset": {"dimensions": [x_col, y_col, "_anomaly"], "source": source}
            }

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

        return df_out, chart_data, metrics

    except Exception as e:
        return df, None, {"error": str(e)}
