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


def chart_boxplot(df: pd.DataFrame, cat_col: str, value_col: str, title: str = "") -> dict:
    df_clean = df.dropna(subset=[cat_col, value_col])
    
    # Top 5 categorias
    top_cats = df_clean[cat_col].value_counts().head(5).index
    df_filt = df_clean[df_clean[cat_col].isin(top_cats)]
    
    # Calcular stats
    labels = []
    data_arrays = []
    
    for cat in top_cats:
        series = df_filt[df_filt[cat_col] == cat][value_col]
        if len(series) < 5:
            continue
        q1 = series.quantile(0.25)
        med = series.median()
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        
        # Whiskers with 1.5 IQR
        min_val = max(series.min(), q1 - 1.5 * iqr)
        max_val = min(series.max(), q3 + 1.5 * iqr)
        
        labels.append(str(cat))
        # Format for @sgratzl/chartjs-chart-boxplot is [min, q1, median, q3, max]
        data_arrays.append([min_val, q1, med, q3, max_val])
        
    if not labels:
        raise ValueError("Sin datos para boxplot")

    return {
        "type": "boxplot",
        "labels": labels,
        "datasets": [{
            "label": value_col,
            "data": data_arrays,
            "backgroundColor": "rgba(200, 255, 106, 0.6)",
            "borderColor": "#111",
            "borderWidth": 2,
            "itemBackgroundColor": "#815ae1"
        }],
        "title": title
    }

def chart_scatter_trend(df: pd.DataFrame, x_col: str, y_col: str, title: str = "") -> dict:
    df_clean = df.dropna(subset=[x_col, y_col])
    if len(df_clean) > 1000:
        df_clean = df_clean.sample(1000, random_state=42)
        
    return {
        "type": "scatter",
        "normal": {
            "x": df_clean[x_col].tolist(),
            "y": df_clean[y_col].tolist(),
        },
        "x_label": x_col,
        "y_label": y_col,
        "title": title
    }

def auto_charts(df: pd.DataFrame, profile, target_col: str) -> List[Dict[str, Any]]:
    """Genera lista de graficos garantizando un mínimo de 4 visualizaciones ricas."""
    charts = []
    date_cols = profile.date_columns
    cat_cols = profile.categorical_columns
    num_cols = profile.numeric_columns

    if target_col not in num_cols:
        # Fallback if categorical target
        val_counts = df[target_col].value_counts().head(15)
        charts.append({
            "title": f"Distribución de {target_col}",
            "chart_data": {
                "type": "bar_horizontal",
                "labels": val_counts.index.astype(str).tolist(),
                "datasets": [{"label": "Cantidad", "data": val_counts.values.tolist()}],
            },
            "description": f"Ranking de los valores más comunes en la columna {target_col}."
        })
        return charts

    # 1. Timeseries (if dates exist)
    if date_cols:
        dc = date_cols[0]
        try:
            charts.append({
                "title": f"Evolución mensual de {target_col}",
                "chart_data": chart_timeseries_monthly(df, dc, target_col),
                "description": f"Muestra cómo evolucionó {target_col} a lo largo del tiempo."
            })
        except Exception: pass

    # 2. Boxplot (Data Science Dispersión)
    if cat_cols:
        cc = cat_cols[0]
        try:
            charts.append({
                "title": f"Dispersión de {target_col} por {cc}",
                "chart_data": chart_boxplot(df, cc, target_col),
                "description": f"Diagrama de caja mostrando mínimos, máximos y promedios de {target_col}."
            })
        except Exception: pass

    # 3. Scatter Trend (if another numeric exists)
    other_nums = [c for c in num_cols if c != target_col]
    if other_nums:
        nc = other_nums[0]
        try:
            charts.append({
                "title": f"Correlación: {target_col} vs {nc}",
                "chart_data": chart_scatter_trend(df, nc, target_col),
                "description": f"Análisis bivariado para detectar si {nc} empuja a {target_col}."
            })
        except Exception: pass

    # 4. Heatmap/Radar de correlación (if >= 3 numerics)
    if len(num_cols) >= 3:
        try:
            cdata = chart_heatmap_corr(df)
            if cdata:
                charts.append({
                    "title": "Red de Correlación",
                    "chart_data": cdata,
                    "description": "Fuerza estadística entre las variables numéricas."
                })
        except Exception: pass

    # Fill up to 4 charts using alternative columns
    if len(charts) < 4:
        # Histograma
        try:
            charts.append({
                "title": f"Distribución de {target_col}",
                "chart_data": chart_histogram(df, target_col),
                "description": f"Campana de distribución de frecuencias."
            })
        except Exception: pass
        
    if len(charts) < 4 and cat_cols:
        for cc in cat_cols[1:4]:
            if len(charts) >= 4: break
            if df[cc].nunique() > 25: continue
            try:
                charts.append({
                    "title": f"{target_col} agrupado por {cc}",
                    "chart_data": chart_bar_category(df, cc, target_col),
                    "description": f"Ranking horizontal."
                })
            except Exception: pass

    return charts
