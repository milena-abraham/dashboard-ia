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


def build_boxplot_payload(
    df: pd.DataFrame,
    num_col: str,
    cat_col: Any = None,
    chart_id: str = "boxplot",
) -> Any:
    if num_col not in df.columns:
        return None

    clean_df = df.dropna(subset=[num_col])
    if len(clean_df) < 5:
        return None

    source_records = []

    if cat_col and cat_col in df.columns and clean_df[cat_col].nunique() >= 2:
        top_cats = clean_df[cat_col].value_counts().head(8).index.tolist()
        for cat in top_cats:
            s_cat = pd.to_numeric(clean_df[clean_df[cat_col] == cat][num_col], errors="coerce").dropna()
            if len(s_cat) < 3:
                continue
            vals = s_cat.values
            q1 = float(np.percentile(vals, 25))
            med = float(np.percentile(vals, 50))
            q3 = float(np.percentile(vals, 75))
            iqr = q3 - q1
            low = float(max(np.min(vals), q1 - 1.5 * iqr))
            high = float(min(np.max(vals), q3 + 1.5 * iqr))
            outliers = [round(float(v), 2) for v in vals if v < low or v > high]
            if len(outliers) > 25:
                outliers = list(np.random.choice(outliers, 25, replace=False))
            source_records.append({
                "categoria": str(cat),
                "box": [round(low, 2), round(q1, 2), round(med, 2), round(q3, 2), round(high, 2)],
                "outliers": outliers,
            })
        title = f"Dispersión y Cuartiles: {num_col} por {cat_col}"
        insight = f"Compara la mediana, rango intercuartil (IQR) y valores atípicos de {num_col} en cada grupo de {cat_col}."
    else:
        s_num = pd.to_numeric(clean_df[num_col], errors="coerce").dropna()
        if len(s_num) < 5:
            return None
        vals = s_num.values
        q1 = float(np.percentile(vals, 25))
        med = float(np.percentile(vals, 50))
        q3 = float(np.percentile(vals, 75))
        iqr = q3 - q1
        low = float(max(np.min(vals), q1 - 1.5 * iqr))
        high = float(min(np.max(vals), q3 + 1.5 * iqr))
        outliers = [round(float(v), 2) for v in vals if v < low or v > high]
        if len(outliers) > 25:
            outliers = list(np.random.choice(outliers, 25, replace=False))
        source_records.append({
            "categoria": str(num_col),
            "box": [round(low, 2), round(q1, 2), round(med, 2), round(q3, 2), round(high, 2)],
            "outliers": outliers,
        })
        title = f"Dispersión y Cuartiles: {num_col}"
        insight = f"Mediana en {med:,.2f} con rango central (IQR) de {q1:,.2f} a {q3:,.2f}."

    if not source_records:
        return None

    return {
        "chart_id": chart_id,
        "metadata": {
            "title": title,
            "insight_subtitle": insight,
            "source_metric": num_col,
        },
        "layout_directives": {
            "chart_type": "BoxPlot",
            "x_axis_type": "category",
            "y_axis_type": "value",
            "is_log_scale": False,
            "has_time_gaps": False,
            "high_cardinality": len(source_records) > 5,
            "show_confidence_bands": False,
        },
        "dataset": {
            "dimensions": ["categoria", "box", "outliers"],
            "source": source_records,
        },
    }


def auto_charts(df: pd.DataFrame, profile, target_col: str) -> List[Dict[str, Any]]:
    charts: List[Dict[str, Any]] = []
    seen_ids = set()

    def add_chart(c):
        if c and c.get("chart_id") not in seen_ids:
            seen_ids.add(c.get("chart_id"))
            charts.append(c)

    date_cols = profile.date_columns
    cat_cols = profile.categorical_columns
    num_cols = profile.numeric_columns

    # 1. Gráficos temporales si existen fechas
    if date_cols and target_col in num_cols:
        dc = date_cols[0]
        df_temp = df.copy()
        df_temp[dc] = pd.to_datetime(df_temp[dc], errors='coerce').dt.normalize()
        df_temp = df_temp.dropna(subset=[dc, target_col])
        if len(df_temp) >= 5:
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
            if len(agg) >= 3:
                agg[dc] = agg[dc].dt.strftime("%Y-%m-%d")
                agg[target_col] = agg[target_col].round(2)
                add_chart(build_autoviz_payload(
                    df=df_temp, chart_id="time_evo", title=f"Evolución Temporal de {target_col}",
                    insight=insight_desc,
                    chart_type="LineChart", dimensions=[dc, target_col], source_df=agg, is_time=True
                ))

    # Identificar categorías principales
    valid_cats = [c for c in cat_cols if 2 <= df[c].nunique() <= 30]
    chosen_cat = valid_cats[0] if valid_cats else (cat_cols[0] if cat_cols else None)
    second_cat = valid_cats[1] if len(valid_cats) > 1 else (cat_cols[1] if len(cat_cols) > 1 else None)

    if target_col not in num_cols:
        # ─────────────────────────────────────────────────────────────
        # CASO A: Target Categórico
        # ─────────────────────────────────────────────────────────────
        # A1. Distribución de Target
        vc = df[target_col].value_counts().reset_index()
        vc.columns = [target_col, "Cantidad"]
        ctype = "Donut" if len(vc) < 6 else "HorizontalBar"
        top_name = str(vc.iloc[0][target_col])
        top_count = int(vc.iloc[0]["Cantidad"])
        add_chart(build_autoviz_payload(
            df=vc, chart_id="cat_dist", title=f"Distribución de {target_col}",
            insight=f"'{top_name}' es la opción más común con {top_count:,} registros.",
            chart_type=ctype, dimensions=[target_col, "Cantidad"], source_df=vc.head(15)
        ))

        # A2. Promedios numéricos y BoxPlots por Target
        for idx, nc in enumerate(num_cols):
            agg = df.groupby(target_col)[nc].mean().reset_index().sort_values(nc, ascending=False)
            agg[nc] = agg[nc].round(2)
            top_cat_mean = str(agg.iloc[0][target_col])
            top_val_mean = float(agg.iloc[0][nc])
            add_chart(build_autoviz_payload(
                df=df, chart_id=f"cat_num_{nc}", title=f"Promedio de {nc} por {target_col}",
                insight=f"'{top_cat_mean}' tiene el promedio más alto con {top_val_mean:,.2f}.",
                chart_type="HorizontalBar", dimensions=[target_col, nc], source_df=agg.head(15)
            ))

            # Boxplot para las primeras 2 numéricas
            if idx < 2:
                add_chart(build_boxplot_payload(
                    df, num_col=nc, cat_col=target_col, chart_id=f"boxplot_{nc}_{target_col}"
                ))

        # A3. Distribución de categoría secundaria si existe
        if second_cat and second_cat != target_col:
            vc2 = df[second_cat].value_counts().reset_index()
            vc2.columns = [second_cat, "Cantidad"]
            ctype2 = "Donut" if len(vc2) < 6 else "HorizontalBar"
            add_chart(build_autoviz_payload(
                df=vc2, chart_id="cat2_dist", title=f"Distribución de {second_cat}",
                insight=f"Concentración de registros por {second_cat}.",
                chart_type=ctype2, dimensions=[second_cat, "Cantidad"], source_df=vc2.head(15)
            ))

        # A4. Histograma de la primera numérica
        if num_cols:
            primary_nc = num_cols[0]
            s_nc = df[primary_nc].dropna()
            if len(s_nc) >= 10:
                counts, bin_edges = np.histogram(s_nc, bins=8)
                bin_labels = [f"{round(float(bin_edges[i]), 1)} a {round(float(bin_edges[i+1]), 1)}" for i in range(len(counts))]
                hist_df = pd.DataFrame({"Rango": bin_labels, "Frecuencia": [int(c) for c in counts]})
                add_chart(build_autoviz_payload(
                    df=hist_df, chart_id=f"hist_{primary_nc}", title=f"Distribución de {primary_nc}",
                    insight=f"Frecuencia y dispersión general de {primary_nc}.",
                    chart_type="HorizontalBar", dimensions=["Rango", "Frecuencia"], source_df=hist_df
                ))

    else:
        # ─────────────────────────────────────────────────────────────
        # CASO B: Target Numérico
        # ─────────────────────────────────────────────────────────────
        # B1. Target por Categoría Principal
        if chosen_cat and df[chosen_cat].nunique() >= 2:
            agg = df.groupby(chosen_cat)[target_col].mean().reset_index().sort_values(target_col, ascending=False)
            agg[target_col] = agg[target_col].round(2)
            ctype = "Donut" if len(agg) < 5 else "HorizontalBar"
            top_group = str(agg.iloc[0][chosen_cat])
            top_val = float(agg.iloc[0][target_col])
            add_chart(build_autoviz_payload(
                df=df, chart_id="num_cat", title=f"{target_col} por {chosen_cat}",
                insight=f"'{top_group}' lidera con un promedio de {top_val:,.2f}.",
                chart_type=ctype, dimensions=[chosen_cat, target_col], source_df=agg.head(15)
            ))

            # B2. BOXPLOT: Target por Categoría Principal
            add_chart(build_boxplot_payload(
                df, num_col=target_col, cat_col=chosen_cat, chart_id=f"boxplot_{target_col}"
            ))
        else:
            # Boxplot univariado del target
            add_chart(build_boxplot_payload(
                df, num_col=target_col, cat_col=None, chart_id=f"boxplot_{target_col}"
            ))

        # B3. Histograma de Distribución del Target
        target_series = df[target_col].dropna()
        if len(target_series) >= 10:
            try:
                counts, bin_edges = np.histogram(target_series, bins=8)
                bin_labels = [f"{round(float(bin_edges[i]), 1)} a {round(float(bin_edges[i+1]), 1)}" for i in range(len(counts))]
                hist_df = pd.DataFrame({"Rango": bin_labels, "Frecuencia": [int(c) for c in counts]})
                max_idx = int(counts.argmax())
                top_range = hist_df.iloc[max_idx]["Rango"]
                add_chart(build_autoviz_payload(
                    df=hist_df, chart_id="dist_hist",
                    title=f"Distribución de {target_col}",
                    insight=f"La mayoría de los registros se concentran entre {top_range}.",
                    chart_type="HorizontalBar",
                    dimensions=["Rango", "Frecuencia"],
                    source_df=hist_df
                ))
            except Exception:
                pass

        # B4. Correlación / Relación inteligente (Scatter con trendline)
        other_nums = [c for c in num_cols if c != target_col]
        best_corr_col = None
        best_r = 0.0

        if other_nums and len(df) >= 15:
            try:
                candidate_nums = [c for c in other_nums if df[c].std() > 1e-6]
                if candidate_nums:
                    sub_corr = df[[target_col] + candidate_nums].dropna()
                    if len(sub_corr) >= 15:
                        corr_series = sub_corr.corr()[target_col].drop(target_col).dropna()
                        if not corr_series.empty:
                            best_corr_col = corr_series.abs().idxmax()
                            best_r = float(corr_series[best_corr_col])
            except Exception:
                pass

        if best_corr_col and abs(best_r) >= 0.18:
            scatter_df = df[[best_corr_col, target_col]].dropna()
            if len(scatter_df) > 300:
                scatter_df = scatter_df.sample(300, random_state=42)
            trendline_data = None
            try:
                m, b = np.polyfit(scatter_df[best_corr_col], scatter_df[target_col], 1)
                trendline_data = {
                    "slope": round(float(m), 4),
                    "intercept": round(float(b), 4),
                    "r": round(best_r, 2),
                    "min_x": round(float(scatter_df[best_corr_col].min()), 3),
                    "max_x": round(float(scatter_df[best_corr_col].max()), 3)
                }
            except Exception:
                pass
            rel_dir = "aumentar" if best_r > 0 else "disminuir"
            rel_tipo = "directa" if best_r > 0 else "inversa"
            add_chart(build_autoviz_payload(
                df=df, chart_id="scatter_corr",
                title=f"Relación: {target_col} vs {best_corr_col}",
                insight=f"A mayor {best_corr_col}, tiende a {rel_dir} {target_col} (relación {rel_tipo} de {best_r:+.2f}).",
                chart_type="Scatter",
                dimensions=[best_corr_col, target_col],
                source_df=scatter_df,
                trendline=trendline_data
            ))

        # B5. Volumen de la Categoría Principal (Donut / HorizontalBar)
        if chosen_cat:
            vc = df[chosen_cat].value_counts().reset_index()
            vc.columns = [chosen_cat, "Cantidad"]
            ctype_vc = "Donut" if len(vc) < 6 else "HorizontalBar"
            add_chart(build_autoviz_payload(
                df=vc, chart_id=f"vol_{chosen_cat}", title=f"Volumen por {chosen_cat}",
                insight=f"Distribución de registros por categoría en {chosen_cat}.",
                chart_type=ctype_vc, dimensions=[chosen_cat, "Cantidad"], source_df=vc.head(10)
            ))

        # B6. Target por Categoría Secundaria
        if second_cat and second_cat != chosen_cat:
            agg2 = df.groupby(second_cat)[target_col].mean().reset_index().sort_values(target_col, ascending=False)
            agg2[target_col] = agg2[target_col].round(2)
            top_group2 = str(agg2.iloc[0][second_cat])
            top_val2 = float(agg2.iloc[0][target_col])
            add_chart(build_autoviz_payload(
                df=df, chart_id="num_cat_second",
                title=f"{target_col} por {second_cat}",
                insight=f"'{top_group2}' lidera con un promedio de {top_val2:,.2f}.",
                chart_type="HorizontalBar",
                dimensions=[second_cat, target_col],
                source_df=agg2.head(10)
            ))

        # B7. Análisis de variables numéricas secundarias (Promedio y BoxPlot adicional)
        for idx, nc in enumerate(other_nums[:3]):
            if chosen_cat:
                agg_sec = df.groupby(chosen_cat)[nc].mean().reset_index().sort_values(nc, ascending=False)
                agg_sec[nc] = agg_sec[nc].round(2)
                add_chart(build_autoviz_payload(
                    df=df, chart_id=f"sec_mean_{nc}", title=f"Promedio de {nc} por {chosen_cat}",
                    insight=f"Comparativa de {nc} entre los grupos de {chosen_cat}.",
                    chart_type="HorizontalBar", dimensions=[chosen_cat, nc], source_df=agg_sec.head(10)
                ))

            # Boxplot para la variable numérica secundaria
            if idx == 0:
                add_chart(build_boxplot_payload(
                    df, num_col=nc, cat_col=second_cat if second_cat else chosen_cat, chart_id=f"boxplot_sec_{nc}"
                ))

    return charts

