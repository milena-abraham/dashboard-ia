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
    is_time: bool = False
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
        if pd.api.types.is_numeric_dtype(df[dim]) and dim != dimensions[0] if len(dimensions)>1 else True:
            if _detect_skewness(df[dim]):
                is_log_scale = True

    # 3. Time gaps
    has_time_gaps = False
    if is_time:
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
    # ECharts needs simple string keys without NaNs
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

    return {
        "chart_id": chart_id,
        "metadata": {
            "title": title,
            "insight_subtitle": insight,
            "source_metric": dimensions[-1]
        },
        "layout_directives": {
            "chart_type": chart_type,
            "x_axis_type": x_type,
            "y_axis_type": y_type,
            "is_log_scale": is_log_scale,
            "has_time_gaps": has_time_gaps,
            "high_cardinality": high_cardinality,
            "show_confidence_bands": False
        },
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
        # Categorical Target
        vc = df[target_col].value_counts().reset_index()
        vc.columns = [target_col, "Cantidad"]
        ctype = "Donut" if len(vc) < 5 else "HorizontalBar"
        charts.append(build_autoviz_payload(
            df=vc, chart_id="cat_dist", title=f"Distribución de {target_col}",
            insight=f"El valor '{vc.iloc[0][target_col]}' domina con {vc.iloc[0]['Cantidad']} ocurrencias.",
            chart_type=ctype, dimensions=[target_col, "Cantidad"], source_df=vc.head(15)
        ))
        
        for nc in num_cols:
            if len(charts) >= 4: break
            agg = df.groupby(target_col)[nc].mean().reset_index()
            charts.append(build_autoviz_payload(
                df=df, chart_id=f"cat_num_{nc}", title=f"Promedio de {nc} por {target_col}",
                insight=f"Comparativa de métrica {nc}.",
                chart_type="HorizontalBar", dimensions=[target_col, nc], source_df=agg.head(15)
            ))
            
    else:
        # Numeric Target
        if date_cols:
            dc = date_cols[0]
            df_temp = df.copy()
            df_temp[dc] = pd.to_datetime(df_temp[dc], errors='coerce')
            agg = df_temp.groupby(dc)[target_col].mean().reset_index().dropna()
            
            # Subsample for timeseries to avoid huge payload
            if len(agg) > 300:
                agg = agg.set_index(dc).resample("W").mean().reset_index().dropna()
                
            charts.append(build_autoviz_payload(
                df=df_temp, chart_id="time_evo", title=f"Evolución Temporal de {target_col}",
                insight="Análisis longitudinal histórico.",
                chart_type="LineChart", dimensions=[dc, target_col], source_df=agg, is_time=True
            ))
            
        if cat_cols:
            cc = cat_cols[0]
            agg = df.groupby(cc)[target_col].mean().reset_index().sort_values(target_col, ascending=False)
            ctype = "Donut" if len(agg) < 5 else "HorizontalBar"
            charts.append(build_autoviz_payload(
                df=df, chart_id="num_cat", title=f"{target_col} por {cc}",
                insight=f"Segmentado por categorías.",
                chart_type=ctype, dimensions=[cc, target_col], source_df=agg.head(15)
            ))
            
        other_nums = [c for c in num_cols if c != target_col]
        if other_nums:
            nc = other_nums[0]
            scatter_df = df[[nc, target_col]].dropna()
            if len(scatter_df) > 1000: scatter_df = scatter_df.sample(1000, random_state=42)
            charts.append(build_autoviz_payload(
                df=df, chart_id="scatter_corr", title=f"Correlación: {target_col} vs {nc}",
                insight="Dispersión bivariada continua.",
                chart_type="Scatter", dimensions=[nc, target_col], source_df=scatter_df
            ))

    # Guarantee 4 charts
    while len(charts) < 4:
        dummy = df.head(5)[num_cols].reset_index() if num_cols else df.head(5)
        charts.append(build_autoviz_payload(
            df=dummy, chart_id=f"filler_{len(charts)}", title="Muestra de Datos",
            insight="Generado automáticamente.", chart_type="HorizontalBar",
            dimensions=list(dummy.columns)[:2], source_df=dummy
        ))
        
    return charts

