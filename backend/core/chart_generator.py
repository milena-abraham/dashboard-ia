"""
core/chart_generator.py
Motor de seleccion automatica y generacion de graficos con Plotly para Web API.
Retorna las figuras serializadas como JSON (fig.to_json()).
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json

PALETTE = [
    "#667eea", "#764ba2", "#f093fb", "#4facfe",
    "#43e97b", "#fa709a", "#fee140", "#a18cd1",
]

LAYOUT_DEFAULTS = dict(
    font_family="Inter, sans-serif",
    plot_bgcolor="white",
    paper_bgcolor="white",
    margin=dict(l=20, r=20, t=50, b=20),
    colorway=PALETTE,
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
)

def chart_timeseries_monthly(df: pd.DataFrame, date_col: str, value_col: str, title: str = "") -> go.Figure:
    df_m = df.copy()
    df_m[date_col] = pd.to_datetime(df_m[date_col])
    df_m["_month"] = df_m[date_col].dt.to_period("M").astype(str)
    df_agg = df_m.groupby("_month")[value_col].sum().reset_index()
    df_agg.columns = ["Mes", value_col]

    fig = px.bar(df_agg, x="Mes", y=value_col, title=title, color_discrete_sequence=PALETTE)
    fig.update_layout(**LAYOUT_DEFAULTS)
    fig.update_xaxes(tickangle=-30, showgrid=False)
    fig.update_yaxes(gridcolor="#f0f0f0")
    return fig

def chart_bar_category(df: pd.DataFrame, cat_col: str, value_col: str, top_n: int = 15, title: str = "") -> go.Figure:
    df_agg = (
        df.groupby(cat_col)[value_col]
        .sum()
        .reset_index()
        .sort_values(value_col, ascending=True)
        .tail(top_n)
    )

    fig = px.bar(
        df_agg, x=value_col, y=cat_col, orientation="h", title=title,
        color=value_col, color_continuous_scale=[[0, "#c3dafe"], [1, "#667eea"]],
    )
    fig.update_layout(**LAYOUT_DEFAULTS, coloraxis_showscale=False)
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(showgrid=False)
    return fig

def chart_pie(df: pd.DataFrame, cat_col: str, value_col: str, title: str = "") -> go.Figure:
    df_agg = (
        df.groupby(cat_col)[value_col]
        .sum()
        .reset_index()
        .sort_values(value_col, ascending=False)
        .head(8)
    )
    fig = px.pie(df_agg, names=cat_col, values=value_col, title=title, hole=0.45, color_discrete_sequence=PALETTE)
    fig.update_traces(textposition="inside", textinfo="percent+label")
    fig.update_layout(**LAYOUT_DEFAULTS)
    return fig

def chart_histogram(df: pd.DataFrame, value_col: str, title: str = "") -> go.Figure:
    fig = px.histogram(df, x=value_col, nbins=25, title=title, color_discrete_sequence=PALETTE)
    fig.update_layout(**LAYOUT_DEFAULTS)
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(gridcolor="#f0f0f0", title="Frecuencia")
    return fig

def chart_boxplot(df: pd.DataFrame, cat_col: str, value_col: str, title: str = "") -> go.Figure:
    fig = px.box(df, x=cat_col, y=value_col, title=title, color=cat_col, color_discrete_sequence=PALETTE)
    fig.update_layout(**LAYOUT_DEFAULTS, showlegend=False)
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(gridcolor="#f0f0f0")
    return fig

def chart_heatmap_corr(df: pd.DataFrame, title: str = "Mapa de Correlación") -> Optional[go.Figure]:
    numeric_df = df.select_dtypes(include=[float, int])
    if numeric_df.shape[1] < 2:
        return None
    corr = numeric_df.corr().round(2)
    fig = go.Figure(data=go.Heatmap(
        z=corr.values,
        x=corr.columns.tolist(),
        y=corr.index.tolist(),
        colorscale=[[0, "#c3dafe"], [0.5, "white"], [1, "#667eea"]],
        zmid=0,
        text=corr.values,
        texttemplate="%{text}",
        textfont={"size": 11},
    ))
    fig.update_layout(title=title, **LAYOUT_DEFAULTS)
    return fig

def auto_charts(df: pd.DataFrame, profile, target_col: str) -> List[Dict[str, Any]]:
    """Genera lista de graficos en formato dict con fig_json (string JSON de Plotly)."""
    charts = []
    date_cols = profile.date_columns
    cat_cols = profile.categorical_columns
    num_cols = profile.numeric_columns

    if target_col not in num_cols:
        return charts

    # 1. Serie temporal
    if date_cols:
        dc = date_cols[0]
        try:
            fig = chart_timeseries_monthly(df, dc, target_col, title=f"Evolución mensual de {target_col}")
            charts.append({
                "title": f"Evolución mensual de {target_col}",
                "fig_json": fig.to_json(),
                "description": f"Muestra cómo evolucionó {target_col} a lo largo del tiempo agrupado por mes."
            })
        except Exception:
            pass

    # 2. Barras por categoria
    for cc in cat_cols[:3]:
        if df[cc].nunique() > 25:
            continue
        try:
            fig = chart_bar_category(df, cc, target_col, title=f"{target_col} por {cc}")
            charts.append({
                "title": f"{target_col} por {cc}",
                "fig_json": fig.to_json(),
                "description": f"Ranking de {target_col} por cada categoría de {cc}."
            })
        except Exception:
            pass

    # 3. Donut de composicion
    if cat_cols:
        cc = cat_cols[0]
        if df[cc].nunique() <= 8:
            try:
                fig = chart_pie(df, cc, target_col, title=f"Composición de {target_col} por {cc}")
                charts.append({
                    "title": f"Composición de {target_col} por {cc}",
                    "fig_json": fig.to_json(),
                    "description": f"Proporción del total de {target_col} aportado por cada {cc}."
                })
            except Exception:
                pass

    # 4. Histograma
    try:
        fig = chart_histogram(df, target_col, title=f"Distribución de {target_col}")
        charts.append({
            "title": f"Distribución de {target_col}",
            "fig_json": fig.to_json(),
            "description": f"Distribución de frecuencia de los valores de {target_col}."
        })
    except Exception:
        pass

    # 5. Boxplot
    if cat_cols:
        for cc in cat_cols[:2]:
            if 2 <= df[cc].nunique() <= 10:
                try:
                    fig = chart_boxplot(df, cc, target_col, title=f"Distribución de {target_col} por {cc}")
                    charts.append({
                        "title": f"Distribución de {target_col} por {cc}",
                        "fig_json": fig.to_json(),
                        "description": f"Compara la distribución de {target_col} según {cc}."
                    })
                except Exception:
                    pass

    # 6. Heatmap de correlacion
    if len(num_cols) >= 3:
        try:
            fig = chart_heatmap_corr(df.select_dtypes(include=[float, int]))
            if fig:
                charts.append({
                    "title": "Mapa de Correlación",
                    "fig_json": fig.to_json(),
                    "description": "Correlación estadística entre las variables numéricas."
                })
        except Exception:
            pass

    return charts
