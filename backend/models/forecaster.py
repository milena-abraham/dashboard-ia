"""
models/forecaster.py
Forecasting de series temporales usando Prophet o fallback ARIMA/Regresión.
Retorna fig_json y metricas.
"""

from __future__ import annotations
from typing import Optional, Tuple, Dict, Any
import pandas as pd
import numpy as np
import plotly.graph_objects as go

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False


def run_forecast(
    df: pd.DataFrame,
    date_col: str,
    value_col: str,
    periods: int = 60,
    freq: str = "D",
) -> Tuple[Optional[pd.DataFrame], Optional[str], dict]:
    """
    Ejecuta forecast de serie temporal.
    Retorna (df_forecast, fig_json_string, metrics)
    """
    if not PROPHET_AVAILABLE:
        # Fallback simple con extrapolación de tendencia lineal para no romper la app si no está Prophet
        try:
            df_prep = df[[date_col, value_col]].copy()
            df_prep[date_col] = pd.to_datetime(df_prep[date_col], errors="coerce")
            df_prep = df_prep.dropna().sort_values(date_col)
            df_agg = df_prep.groupby(date_col)[value_col].sum().reset_index()
            
            if len(df_agg) < 2:
                return None, None, {"error": "Insuficientes datos para proyecciones."}

            x = np.arange(len(df_agg))
            y = df_agg[value_col].values
            z = np.polyfit(x, y, 1)
            p = np.poly1d(z)

            future_dates = pd.date_range(start=df_agg[date_col].iloc[-1], periods=periods + 1, freq=freq)[1:]
            x_future = np.arange(len(df_agg), len(df_agg) + periods)
            y_future = p(x_future)

            fig = go.Figure()
            fig.add_trace(go.Scatter(x=df_agg[date_col], y=df_agg[value_col], mode="lines+markers", name="Datos reales", line=dict(color="#764ba2", width=2)))
            fig.add_trace(go.Scatter(x=future_dates, y=y_future, mode="lines", name=f"Proyección ({periods} días)", line=dict(color="#667eea", dash="dot", width=2)))
            fig.update_layout(
                title=f"Proyección Lineal de {value_col} ({periods} períodos)",
                font_family="Inter, sans-serif",
                plot_bgcolor="white", paper_bgcolor="white",
                margin=dict(l=20, r=20, t=50, b=20)
            )

            last_val = float(y[-1])
            proj_val = float(y_future[-1])
            trend_pct = round(((proj_val - last_val) / max(abs(last_val), 1)) * 100, 1)

            metrics = {
                "ultimo_valor_real": round(last_val, 2),
                "valor_final_forecast": round(proj_val, 2),
                "tendencia_pct": trend_pct,
                "periodos": periods,
                "motor": "Regresión de Tendencia (Fast)",
            }
            return None, fig.to_json(), metrics
        except Exception as ex:
            return None, None, {"error": f"Error en cálculo de proyección: {str(ex)}"}

    try:
        df_prep = df[[date_col, value_col]].copy()
        df_prep[date_col] = pd.to_datetime(df_prep[date_col], errors="coerce")
        df_prep = df_prep.dropna()

        df_agg = df_prep.groupby(date_col)[value_col].sum().reset_index()
        df_agg.columns = ["ds", "y"]
        df_agg = df_agg.sort_values("ds")

        if len(df_agg) < 2:
            return None, None, {"error": "Insuficientes datos para forecasting."}

        model = Prophet(
            yearly_seasonality=True if len(df_agg) > 180 else False,
            weekly_seasonality=True if len(df_agg) > 14 else False,
            daily_seasonality=False,
            seasonality_mode="multiplicative",
            interval_width=0.8,
        )
        model.fit(df_agg)

        future = model.make_future_dataframe(periods=periods, freq=freq)
        forecast = model.predict(future)

        last_actual = float(df_agg["y"].iloc[-1])
        end_forecast = float(forecast["yhat"].iloc[-1])
        trend_pct = round(((end_forecast - last_actual) / max(abs(last_actual), 1)) * 100, 1)

        metrics = {
            "ultimo_valor_real": round(last_actual, 2),
            "valor_final_forecast": round(end_forecast, 2),
            "tendencia_pct": trend_pct,
            "periodos": periods,
            "motor": "Prophet (Meta AI)",
        }

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=pd.concat([forecast["ds"], forecast["ds"].iloc[::-1]]),
            y=pd.concat([forecast["yhat_upper"], forecast["yhat_lower"].iloc[::-1]]),
            fill="toself",
            fillcolor="rgba(102, 126, 234, 0.15)",
            line=dict(color="rgba(255,255,255,0)"),
            name="Confianza 80%",
        ))
        fig.add_trace(go.Scatter(
            x=forecast["ds"], y=forecast["yhat"],
            line=dict(color="#667eea", width=2, dash="dot"),
            name="Predicción",
        ))
        fig.add_trace(go.Scatter(
            x=df_agg["ds"], y=df_agg["y"],
            line=dict(color="#764ba2", width=2.5),
            mode="lines+markers",
            name="Datos reales",
        ))
        fig.update_layout(
            title=f"Predicción de {value_col} (Próximos {periods} días)",
            font_family="Inter, sans-serif",
            plot_bgcolor="white", paper_bgcolor="white",
            margin=dict(l=20, r=20, t=50, b=20),
        )

        return forecast, fig.to_json(), metrics

    except Exception as e:
        return None, None, {"error": str(e)}
