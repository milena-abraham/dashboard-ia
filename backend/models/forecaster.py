"""
models/forecaster.py
Forecasting de series temporales usando Prophet o fallback ARIMA/Regresión.
Retorna raw data para renderizar con Chart.js en el frontend.
"""

from __future__ import annotations
from typing import Optional, Tuple, Dict, Any
import pandas as pd
import numpy as np

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
) -> Tuple[Optional[pd.DataFrame], Optional[dict], dict]:
    """
    Ejecuta forecast de serie temporal.
    Retorna (df_forecast, data_dict, metrics)
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
            
            chart_data = {
                "labels": df_agg[date_col].dt.strftime('%Y-%m-%d').tolist() + future_dates.strftime('%Y-%m-%d').tolist(),
                "real_values": [x if not pd.isna(x) else None for x in y] + [None] * len(future_dates),
                "forecast_values": [None] * (len(df_agg) - 1) + [y[-1]] + y_future.tolist(),
            }
            
            return None, chart_data, metrics
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

        merged = pd.merge(forecast, df_agg, on='ds', how='left')
        
        # Helper function to convert NaNs to None for JSON serialization
        def to_list_clean(series):
            return [x if not pd.isna(x) else None for x in series]

        chart_data = {
            "labels": merged['ds'].dt.strftime('%Y-%m-%d').tolist(),
            "real_values": to_list_clean(merged['y']),
            "forecast_values": to_list_clean(merged['yhat']),
            "upper_band": to_list_clean(merged['yhat_upper']),
            "lower_band": to_list_clean(merged['yhat_lower']),
        }

        return forecast, chart_data, metrics

    except Exception as e:
        return None, None, {"error": str(e)}
