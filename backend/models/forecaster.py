"""
models/forecaster.py
Forecasting de series temporales usando Prophet o fallback ARIMA/Regresión.
Retorna raw data para renderizar con Chart.js en el frontend.
"""

from __future__ import annotations
from typing import Optional, Tuple, Dict, Any
import pandas as pd
import numpy as np
import traceback

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
    try:
        df_prep = df[[date_col, value_col]].copy()
        df_prep[date_col] = pd.to_datetime(df_prep[date_col], errors="coerce")
        df_prep = df_prep.dropna()

        if len(df_prep) < 2:
            return None, None, {"error": "Se requieren al menos 2 fechas válidas con datos numéricos."}

        df_agg = df_prep.groupby(date_col)[value_col].mean().reset_index()
        df_agg.columns = ["ds", "y"]
        df_agg = df_agg.sort_values("ds")
        # Only downsample if extremely dense (e.g. hourly data)
        if len(df_agg) > 3000:
            df_agg = df_agg.set_index("ds").resample("W").mean().reset_index()

        if len(df_agg) < 5:
            return None, None, {"error": "Insuficientes datos agregados por fecha para proyecciones (min: 5)."}
            
        # Check variance (flat series)
        if df_agg["y"].nunique() <= 1:
            return None, None, {"error": "La serie de tiempo es constante (varianza 0). No se puede proyectar."}
            
        if not PROPHET_AVAILABLE:
            # Fallback simple con extrapolación de tendencia lineal
            x = np.arange(len(df_agg))
            y = df_agg["y"].values
            z = np.polyfit(x, y, 1)
            p = np.poly1d(z)

            future_dates = pd.date_range(start=df_agg["ds"].iloc[-1], periods=periods + 1, freq=freq)[1:]
            x_future = np.arange(len(df_agg), len(df_agg) + periods)
            y_future = p(x_future)

            last_val = float(y[-1])
            proj_val = float(y_future[-1])
            trend_pct = round(((proj_val - last_val) / max(abs(last_val), 1)) * 100, 1)

            # Pseudo-MAE (In-sample)
            y_pred_in_sample = p(x)
            mae = np.mean(np.abs(y - y_pred_in_sample))
            mse = np.mean((y - y_pred_in_sample)**2)
            std_err = np.sqrt(mse) if len(y) > 2 else 0
            margin = 1.96 * std_err

            metrics = {
                "ultimo_valor_real": round(last_val, 2),
                "valor_final_forecast": round(proj_val, 2),
                "tendencia_pct": trend_pct,
                "periodos": periods,
                "motor": "Regresión Lineal",
                "mae": round(mae, 2),
                "confianza": "Baja (pocos datos o modelo base)"
            }
            
            upper_future = y_future + margin
            lower_future = y_future - margin
            
            dates = df_agg["ds"].dt.strftime('%Y-%m-%d').tolist() + future_dates.strftime('%Y-%m-%d').tolist()
            reals = [x if not pd.isna(x) else None for x in y] + [None] * len(future_dates)
            fores = [None] * (len(df_agg) - 1) + [y[-1]] + y_future.tolist()
            ups = [None] * (len(df_agg) - 1) + [y[-1]] + upper_future.tolist()
            downs = [None] * (len(df_agg) - 1) + [y[-1]] + lower_future.tolist()
            
            source = []
            for i in range(len(dates)):
                source.append({"date": dates[i], "historical": reals[i], "forecast": fores[i], "upper": ups[i], "lower": downs[i]})
                
            chart_data = {
                "chart_id": "forecast",
                "metadata": {"title": f"Proyección a {periods} períodos", "insight_subtitle": f"Tendencia del {trend_pct}%", "source_metric": value_col},
                "layout_directives": {"chart_type": "FanChart", "x_axis_type": "time", "y_axis_type": "value", "is_log_scale": False, "has_time_gaps": False, "high_cardinality": False, "show_confidence_bands": True},
                "dataset": {"dimensions": ["date", "historical", "forecast", "upper", "lower"], "source": source}
            }
            return None, chart_data, metrics

        # Model Prophet
        model = Prophet(
            yearly_seasonality=True if len(df_agg) > 180 else False,
            weekly_seasonality=True if len(df_agg) > 14 else False,
            daily_seasonality=False,
            seasonality_mode="additive" if df_agg["y"].min() <= 0 else "multiplicative",
            interval_width=0.8,
        )
        model.fit(df_agg)

        # Predict future
        future = model.make_future_dataframe(periods=periods, freq=freq)
        forecast = model.predict(future)

        last_actual = float(df_agg["y"].iloc[-1])
        end_forecast = float(forecast["yhat"].iloc[-1])
        trend_pct = round(((end_forecast - last_actual) / max(abs(last_actual), 1)) * 100, 1)

        # Out-Of-Sample (OOS) Validation para evitar over-fitting y dar una precisión real
        n_points = len(df_agg)
        test_size = max(2, int(n_points * 0.15))
        
        if n_points > 15:
            df_train = df_agg.iloc[:-test_size].copy()
            df_test = df_agg.iloc[-test_size:].copy()
            
            # Eval Model
            model_eval = Prophet(
                yearly_seasonality=True if len(df_train) > 180 else False,
                weekly_seasonality=True if len(df_train) > 14 else False,
                daily_seasonality=False,
                seasonality_mode="additive" if df_train["y"].min() <= 0 else "multiplicative",
                interval_width=0.8,
            )
            model_eval.fit(df_train)
            
            # Predict only test periods
            future_eval = model_eval.make_future_dataframe(periods=test_size, freq=freq)
            forecast_eval = model_eval.predict(future_eval)
            oos_pred = forecast_eval["yhat"].iloc[-test_size:].values
            oos_real = df_test["y"].values
            
            mae = np.mean(np.abs(oos_real - oos_pred))
            mape = np.mean(np.abs((oos_real - oos_pred) / (np.abs(oos_real) + 0.001))) * 100
        else:
            # Fallback a In-Sample si hay muy pocos datos
            in_sample = forecast.set_index("ds")["yhat"].loc[df_agg["ds"]].values
            mae = np.mean(np.abs(df_agg["y"].values - in_sample))
            mape = np.mean(np.abs((df_agg["y"].values - in_sample) / (np.abs(df_agg["y"].values) + 0.001))) * 100
        
        # Confidence logic based on OOS MAPE
        confianza = "Alta"
        if len(df_agg) < 30 or mape > 25:
            confianza = "Baja"
        elif len(df_agg) < 90 or mape > 10:
            confianza = "Media"

        metrics = {
            "ultimo_valor_real": round(last_actual, 2),
            "valor_final_forecast": round(end_forecast, 2),
            "tendencia_pct": trend_pct,
            "periodos": periods,
            "motor": "Prophet (Meta AI)",
            "mae": round(mae, 2),
            "mape": round(mape, 2),
            "confianza": confianza,
            "validacion": "Out-of-Sample (OOS)" if n_points > 15 else "In-Sample"
        }

        merged = pd.merge(forecast, df_agg, on='ds', how='left')
        
        def to_list_clean(series):
            return [x if not pd.isna(x) else None for x in series]

        dates = merged['ds'].dt.strftime('%Y-%m-%d').tolist()
        reals = to_list_clean(merged['y'])
        fores = to_list_clean(merged['yhat'])
        ups = to_list_clean(merged['yhat_upper'])
        downs = to_list_clean(merged['yhat_lower'])
        
        source = []
        for i in range(len(dates)):
            source.append({"date": dates[i], "historical": reals[i], "forecast": fores[i], "upper": ups[i], "lower": downs[i]})

        chart_data = {
            "chart_id": "forecast",
            "metadata": {"title": f"Proyección a {periods} períodos", "insight_subtitle": f"Tendencia del {trend_pct}%", "source_metric": value_col},
            "layout_directives": {"chart_type": "FanChart", "x_axis_type": "time", "y_axis_type": "value", "is_log_scale": False, "has_time_gaps": False, "high_cardinality": False, "show_confidence_bands": True},
            "dataset": {"dimensions": ["date", "historical", "forecast", "upper", "lower"], "source": source}
        }

        return forecast, chart_data, metrics

    except Exception as e:
        print(f"Error en Prophet:\n{traceback.format_exc()}")
        return None, None, {"error": "Error matemático al calcular la proyección. Revise si hay valores atípicos extremos."}

