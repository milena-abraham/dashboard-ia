"""
core/chart_generator.py
Motor de seleccion automatica y generacion de graficos para Web API (Chart.js raw data format).
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
import pandas as pd


def chart_timeseries_monthly(df: pd.DataFrame, date_col: str, value_col: str, title: str = "") -> dict:
    df_m = df.copy()
    df_m[date_col] = pd.to_datetime(df_m[date_col])
    df_m["_month"] = df_m[date_col].dt.to_period("M").astype(str)
    df_agg = df_m.groupby("_month")[value_col].sum().reset_index()
    df_agg.columns = ["Mes", value_col]

    return {
        "type": "line_area",
        "labels": df_agg["Mes"].tolist(),
        "datasets": [{
            "label": value_col,
            "data": df_agg[value_col].tolist(),
        }],
        "title": title
    }

def chart_bar_category(df: pd.DataFrame, cat_col: str, value_col: str, top_n: int = 15, title: str = "") -> dict:
    df_agg = (
        df.groupby(cat_col)[value_col]
        .sum()
        .reset_index()
        .sort_values(value_col, ascending=True)
        .tail(top_n)
    )

    return {
        "type": "bar_horizontal",
        "labels": df_agg[cat_col].tolist(),
        "datasets": [{
            "label": value_col,
            "data": df_agg[value_col].tolist(),
        }],
        "title": title
    }

def chart_pie(df: pd.DataFrame, cat_col: str, value_col: str, title: str = "") -> dict:
    df_agg = (
        df.groupby(cat_col)[value_col]
        .sum()
        .reset_index()
        .sort_values(value_col, ascending=False)
        .head(8)
    )
    return {
        "type": "doughnut",
        "labels": df_agg[cat_col].tolist(),
        "datasets": [{
            "label": value_col,
            "data": df_agg[value_col].tolist(),
        }],
        "title": title
    }

def chart_histogram(df: pd.DataFrame, value_col: str, title: str = "") -> dict:
    # Manual histogram binning for Chart.js
    counts, bin_edges = pd.cut(df[value_col], bins=25, retbins=True)
    df_hist = counts.value_counts().sort_index()
    
    labels = [f"{round(b.left, 2)} - {round(b.right, 2)}" for b in df_hist.index]
    
    return {
        "type": "bar",
        "labels": labels,
        "datasets": [{
            "label": "Frecuencia",
            "data": df_hist.values.tolist(),
        }],
        "title": title
    }

def chart_heatmap_corr(df: pd.DataFrame, title: str = "Mapa de Correlación") -> Optional[dict]:
    numeric_df = df.select_dtypes(include=[float, int])
    if numeric_df.shape[1] < 2:
        return None
    corr = numeric_df.corr().round(2)
    
    # We can represent correlation as a grouped bar chart or simple list for Chart.js since Chart.js doesn't have a native Heatmap
    # However, to keep it simple, we will return a radar chart of correlations for the top 5 variables against each other
    top_vars = corr.columns[:5].tolist()
    datasets = []
    for var in top_vars:
        datasets.append({
            "label": var,
            "data": corr.loc[var, top_vars].tolist()
        })
        
    return {
        "type": "radar",
        "metrics": top_vars,
        "datasets": datasets,
        "title": title
    }

def auto_charts(df: pd.DataFrame, profile, target_col: str) -> List[Dict[str, Any]]:
    """Genera lista de graficos en formato dict con chart_data (raw data JSON)."""
    charts = []
    date_cols = profile.date_columns
    cat_cols = profile.categorical_columns
    num_cols = profile.numeric_columns

    if target_col not in num_cols:
        # Generar gráficos de frecuencia para variables categóricas
        try:
            val_counts = df[target_col].value_counts().head(15)
            charts.append({
                "title": f"Distribución de {target_col}",
                "chart_data": {
                    "type": "bar_horizontal",
                    "labels": val_counts.index.astype(str).tolist(),
                    "datasets": [{
                        "label": "Cantidad",
                        "data": val_counts.values.tolist(),
                    }],
                    "title": f"Frecuencia de {target_col}"
                },
                "description": f"Ranking de los valores más comunes en la columna {target_col}."
            })
        except Exception:
            pass
            
        try:
            if len(df[target_col].unique()) <= 8:
                val_counts = df[target_col].value_counts()
                charts.append({
                    "title": f"Composición de {target_col}",
                    "chart_data": {
                        "type": "doughnut",
                        "labels": val_counts.index.astype(str).tolist(),
                        "datasets": [{
                            "label": "Cantidad",
                            "data": val_counts.values.tolist(),
                        }],
                        "title": f"Composición de {target_col}"
                    },
                    "description": f"Porcentaje de participación de cada valor en {target_col}."
                })
        except Exception:
            pass

        return charts
    # 1. Serie temporal
    if date_cols:
        dc = date_cols[0]
        try:
            cdata = chart_timeseries_monthly(df, dc, target_col, title=f"Evolución mensual de {target_col}")
            charts.append({
                "title": f"Evolución mensual de {target_col}",
                "chart_data": cdata,
                "description": f"Muestra cómo evolucionó {target_col} a lo largo del tiempo agrupado por mes."
            })
        except Exception:
            pass

    # 2. Barras por categoria
    for cc in cat_cols[:3]:
        if df[cc].nunique() > 25:
            continue
        try:
            cdata = chart_bar_category(df, cc, target_col, title=f"{target_col} por {cc}")
            charts.append({
                "title": f"{target_col} por {cc}",
                "chart_data": cdata,
                "description": f"Ranking de {target_col} por cada categoría de {cc}."
            })
        except Exception:
            pass

    # 3. Donut de composicion
    if cat_cols:
        cc = cat_cols[0]
        if df[cc].nunique() <= 8:
            try:
                cdata = chart_pie(df, cc, target_col, title=f"Composición de {target_col} por {cc}")
                charts.append({
                    "title": f"Composición de {target_col} por {cc}",
                    "chart_data": cdata,
                    "description": f"Proporción del total de {target_col} aportado por cada {cc}."
                })
            except Exception:
                pass

    # 4. Histograma
    try:
        cdata = chart_histogram(df, target_col, title=f"Distribución de {target_col}")
        charts.append({
            "title": f"Distribución de {target_col}",
            "chart_data": cdata,
            "description": f"Distribución de frecuencia de los valores de {target_col}."
        })
    except Exception:
        pass

    # 5. Heatmap de correlacion (convertido a radar)
    if len(num_cols) >= 3:
        try:
            cdata = chart_heatmap_corr(df.select_dtypes(include=[float, int]))
            if cdata:
                charts.append({
                    "title": "Mapa de Correlación",
                    "chart_data": cdata,
                    "description": "Correlación estadística entre las variables numéricas principales."
                })
        except Exception:
            pass

    return charts
