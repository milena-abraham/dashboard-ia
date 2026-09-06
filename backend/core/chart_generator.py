import pandas as pd
import numpy as np
from typing import List, Dict, Any
from core.data_profiler import COLUMN_TYPE_NUMERIC, COLUMN_TYPE_CATEGORICAL, COLUMN_TYPE_DATE

def _detect_skewness(series: pd.Series) -> bool:
    try:
        from scipy.stats import skew
        s = skew(series.dropna())
        return abs(s) > 1.5
    except:
        return False

def _detect_time_gaps(series: pd.Series) -> bool:
    try:
        deltas = series.sort_values().diff().dropna()
        if deltas.empty: return False
        mode_delta = deltas.mode()[0]
        if pd.isna(mode_delta): return False
        return (deltas > mode_delta * 1.5).any()
    except:
        return False

def build_autoviz_payload(
    df: pd.DataFrame, 
    chart_id: str,
    title: str,
    insight: str,
    chart_type: str,
    dimensions: List[str],
    source_df: pd.DataFrame,
    is_time: bool = False,
    trendline: Any = None
) -> Dict[str, Any]:
    
    # 1. Cardinality
    high_cardinality = False
    if chart_type in ["Donut", "HorizontalBar"] and len(source_df) >= 5:
        high_cardinality = True
        if chart_type == "Donut":
            chart_type = "HorizontalBar" # Force horizontal bar if cardinality >= 5

    # 2. Skewness
    is_log_scale = False
    for dim in dimensions:
        if dim in df.columns and pd.api.types.is_numeric_dtype(df[dim]) and (dim != dimensions[0] if len(dimensions) > 1 else True):
            if _detect_skewness(df[dim]):
                is_log_scale = True

    # 3. Time gaps
    has_time_gaps = False
    if is_time and dimensions and dimensions[0] in df.columns:
        has_time_gaps = _detect_time_gaps(df[dimensions[0]])

    x_type = "category"
    y_type = "value"
    
    if is_time:
        x_type = "time"
    
    if chart_type == "HorizontalBar":
        x_type, y_type = "value", "category"
    
    if chart_type == "Scatter":
        x_type, y_type = "value", "value"

    # Convert source
    source_records = []
    for record in source_df.to_dict(orient="records"):
        clean_record = {}
        for k, v in record.items():
            if pd.isna(v):
                clean_record[k] = None
            elif isinstance(v, (pd.Timestamp, np.datetime64)):
                clean_record[k] = str(v.date())
            else:
                clean_record[k] = v
        source_records.append(clean_record)

    layout_directives: Dict[str, Any] = {
        "chart_type": chart_type,
        "x_axis_type": x_type,
        "y_axis_type": y_type,
        "is_log_scale": is_log_scale,
        "has_time_gaps": has_time_gaps,
        "high_cardinality": high_cardinality,
        "show_confidence_bands": False
    }

    if trendline:
        layout_directives["trendline"] = trendline

    return {
        "chart_id": chart_id,
        "metadata": {
            "title": title,
            "insight_subtitle": insight,
            "source_metric": dimensions[-1]
        },
        "layout_directives": layout_directives,
        "dataset": {
            "dimensions": dimensions,
            "source": source_records
        }
    }


def auto_charts(df: pd.DataFrame, profile, target_col: str) -> List[Dict[str, Any]]:
    charts = []
    
    date_cols = profile.date_columns
    cat_cols = profile.categorical_columns
    num_cols = profile.numeric_columns

    if target_col not in num_cols:
        # ─────────────────────────────────────────────────────────────
        # Variable objetivo Categórica
        # ─────────────────────────────────────────────────────────────
        vc = df[target_col].value_counts().reset_index()
        vc.columns = [target_col, "Cantidad"]
        ctype = "Donut" if len(vc) < 5 else "HorizontalBar"
        top_name = str(vc.iloc[0][target_col])
        top_count = int(vc.iloc[0]["Cantidad"])
        charts.append(build_autoviz_payload(
            df=vc, chart_id="cat_dist", title=f"Distribución de {target_col}",
            insight=f"'{top_name}' es la opción más común con {top_count:,} registros.",
            chart_type=ctype, dimensions=[target_col, "Cantidad"], source_df=vc.head(15)
        ))
        
        for nc in num_cols:
            if len(charts) >= 4:
                break
            agg = df.groupby(target_col)[nc].mean().reset_index().sort_values(nc, ascending=False)
            agg[nc] = agg[nc].round(2)
            top_cat_mean = str(agg.iloc[0][target_col])
            top_val_mean = float(agg.iloc[0][nc])
            charts.append(build_autoviz_payload(
                df=df, chart_id=f"cat_num_{nc}", title=f"Promedio de {nc} por {target_col}",
                insight=f"'{top_cat_mean}' tiene el promedio más alto con {top_val_mean:,.2f}.",
                chart_type="HorizontalBar", dimensions=[target_col, nc], source_df=agg.head(15)
            ))
            
    else:
        # ─────────────────────────────────────────────────────────────
        # Variable objetivo Numérica
        # ─────────────────────────────────────────────────────────────
        # 1. Gráfico temporal si existen fechas
        if date_cols:
            dc = date_cols[0]
            df_temp = df.copy()
            df_temp[dc] = pd.to_datetime(df_temp[dc], errors='coerce').dt.normalize()
            df_temp = df_temp.dropna(subset=[dc, target_col])
            
            min_date = df_temp[dc].min()
            max_date = df_temp[dc].max()
            span_days = int((max_date - min_date).days) if pd.notna(min_date) and pd.notna(max_date) else 0
            n_dates = df_temp[dc].nunique()
            
            if span_days > 1095:
                freq = "MS"
                insight_desc = f"Promedio mensual de {target_col} en el tiempo."
            elif span_days > 90 or n_dates > 90:
                freq = "W"
                insight_desc = f"Promedio semanal de {target_col} para ver la tendencia."
            else:
                freq = "D"
                insight_desc = f"Valores diarios de {target_col} registrados."
                
            agg = df_temp.groupby(pd.Grouper(key=dc, freq=freq))[target_col].mean().reset_index().dropna()
            agg[dc] = agg[dc].dt.strftime("%Y-%m-%d")
            agg[target_col] = agg[target_col].round(2)
                
            charts.append(build_autoviz_payload(
                df=df_temp, chart_id="time_evo", title=f"Evolución Temporal de {target_col}",
                insight=insight_desc,
                chart_type="LineChart", dimensions=[dc, target_col], source_df=agg, is_time=True
            ))
            
        # 2. Gráfico por Categoría (eligiendo columna con buena diversidad de 2 a 30 valores)
        chosen_cat = None
        if cat_cols:
            # Buscar columnas categóricas con cardinalidad amigable
            valid_cats = [c for c in cat_cols if 2 <= df[c].nunique() <= 30]
            if valid_cats:
                chosen_cat = valid_cats[0]
            else:
                chosen_cat = cat_cols[0]

            if chosen_cat and df[chosen_cat].nunique() >= 2:
                agg = df.groupby(chosen_cat)[target_col].mean().reset_index().sort_values(target_col, ascending=False)
                agg[target_col] = agg[target_col].round(2)
                ctype = "Donut" if len(agg) < 5 else "HorizontalBar"
                top_group = str(agg.iloc[0][chosen_cat])
                top_val = float(agg.iloc[0][target_col])
                charts.append(build_autoviz_payload(
                    df=df, chart_id="num_cat", title=f"{target_col} por {chosen_cat}",
                    insight=f"'{top_group}' lidera con un promedio de {top_val:,.2f}.",
                    chart_type=ctype, dimensions=[chosen_cat, target_col], source_df=agg.head(15)
                ))
            
        # 3. Relación / Correlación inteligente (o Histograma de Distribución si no hay correlación)
        other_nums = [c for c in num_cols if c != target_col]
        best_corr_col = None
        best_r = 0.0

        if other_nums and len(df) >= 15:
            try:
                # Filtrar columnas sin varianza
                candidate_nums = [c for c in other_nums if df[c].std() > 1e-6]
                if candidate_nums:
                    sub_corr = df[[target_col] + candidate_nums].dropna()
                    if len(sub_corr) >= 15:
                        corr_series = sub_corr.corr()[target_col].drop(target_col).dropna()
                        if not corr_series.empty:
                            best_corr_col = corr_series.abs().idxmax()
                            best_r = float(corr_series[best_corr_col])
            except Exception:
                best_corr_col = None
                best_r = 0.0

        # Si hay una correlación real (|r| >= 0.18), generamos Scatter con Línea de Tendencia
        if best_corr_col and abs(best_r) >= 0.18:
            scatter_df = df[[best_corr_col, target_col]].dropna()
            if len(scatter_df) > 300:
                scatter_df = scatter_df.sample(300, random_state=42)
            
            trendline_data = None
            try:
                m, b = np.polyfit(scatter_df[best_corr_col], scatter_df[target_col], 1)
                min_x = float(scatter_df[best_corr_col].min())
                max_x = float(scatter_df[best_corr_col].max())
                trendline_data = {
                    "slope": round(float(m), 4),
                    "intercept": round(float(b), 4),
                    "r": round(best_r, 2),
                    "min_x": round(min_x, 3),
                    "max_x": round(max_x, 3)
                }
            except Exception:
                pass

            rel_dir = "aumentar" if best_r > 0 else "disminuir"
            rel_tipo = "directa" if best_r > 0 else "inversa"
            insight_rel = f"A mayor {best_corr_col}, tiende a {rel_dir} {target_col} (relación {rel_tipo} de {best_r:+.2f})."

            charts.append(build_autoviz_payload(
                df=df, chart_id="scatter_corr",
                title=f"Relación: {target_col} vs {best_corr_col}",
                insight=insight_rel,
                chart_type="Scatter",
                dimensions=[best_corr_col, target_col],
                source_df=scatter_df,
                trendline=trendline_data
            ))
        else:
            # Si NO hay correlación real (|r| < 0.18), NUNCA graficamos una nube de puntos aleatoria.
            # En su lugar, mostramos la Distribución (Histograma) de la variable objetivo.
            target_series = df[target_col].dropna()
            if len(target_series) >= 10:
                try:
                    counts, bin_edges = np.histogram(target_series, bins=8)
                    bin_labels = [f"{round(float(bin_edges[i]), 1)} a {round(float(bin_edges[i+1]), 1)}" for i in range(len(counts))]
                    hist_df = pd.DataFrame({"Rango": bin_labels, "Frecuencia": [int(c) for c in counts]})
                    max_idx = int(counts.argmax())
                    top_range = hist_df.iloc[max_idx]["Rango"]
                    charts.append(build_autoviz_payload(
                        df=hist_df, chart_id="dist_hist",
                        title=f"Distribución de {target_col}",
                        insight=f"La mayoría de los registros se concentran entre {top_range}.",
                        chart_type="HorizontalBar",
                        dimensions=["Rango", "Frecuencia"],
                        source_df=hist_df
                    ))
                except Exception:
                    pass

        # 4. Si aún hay espacio (< 4 gráficos) y existe una segunda columna categórica relevante
        if chosen_cat and cat_cols and len(charts) < 4:
            other_cats = [c for c in cat_cols if c != chosen_cat and 2 <= df[c].nunique() <= 30]
            if other_cats:
                cat2 = other_cats[0]
                agg2 = df.groupby(cat2)[target_col].mean().reset_index().sort_values(target_col, ascending=False)
                agg2[target_col] = agg2[target_col].round(2)
                top_group2 = str(agg2.iloc[0][cat2])
                top_val2 = float(agg2.iloc[0][target_col])
                charts.append(build_autoviz_payload(
                    df=df, chart_id="num_cat_second",
                    title=f"{target_col} por {cat2}",
                    insight=f"'{top_group2}' lidera con un promedio de {top_val2:,.2f}.",
                    chart_type="HorizontalBar",
                    dimensions=[cat2, target_col],
                    source_df=agg2.head(10)
                ))

    return charts


        
    return charts

