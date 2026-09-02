from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class ProfileSchema(BaseModel):
    n_rows: int
    n_cols: int
    quality_score: int
    quality_label: str
    numeric_columns: List[str]
    date_columns: List[str]
    categorical_columns: List[str]
    suggested_targets: List[str]

class CleaningReportSchema(BaseModel):
    actions: List[str]
    duplicates_removed: int
    nulls_imputed: Dict[str, int]

class ChartMetadataSchema(BaseModel):
    title: str
    insight_subtitle: str
    source_metric: str

class LayoutDirectivesSchema(BaseModel):
    chart_type: str
    x_axis_type: str
    y_axis_type: str
    is_log_scale: bool
    has_time_gaps: bool
    high_cardinality: bool
    show_confidence_bands: bool

class DatasetSchema(BaseModel):
    dimensions: List[str]
    source: List[Dict[str, Any]]

class ChartSchema(BaseModel):
    chart_id: str
    metadata: ChartMetadataSchema
    layout_directives: LayoutDirectivesSchema
    dataset: DatasetSchema

class ForecastSchema(BaseModel):
    chart_data: Optional[ChartSchema] = None
    metrics: Dict[str, Any]

class SegmentationSchema(BaseModel):
    scatter_data: Optional[ChartSchema] = None
    radar_data: Optional[ChartSchema] = None
    metrics: Dict[str, Any]

class AnomaliesSchema(BaseModel):
    chart_data: Optional[ChartSchema] = None
    metrics: Dict[str, Any]

class FeatureImportanceSchema(BaseModel):
    chart_importance: Optional[ChartSchema] = None
    chart_shap: Optional[ChartSchema] = None
    metrics: Dict[str, Any]

class NarrativeSchema(BaseModel):
    text: Optional[str] = None
    source: Optional[str] = None

class AnalysisResponseSchema(BaseModel):
    filename: str
    target_col: Optional[str] = None
    profile: ProfileSchema
    cleaning_report: CleaningReportSchema
    kpis: Dict[str, Any]
    charts: List[ChartSchema]
    forecast: ForecastSchema
    segmentation: SegmentationSchema
    anomalies: AnomaliesSchema
    feature_importance: FeatureImportanceSchema
    narrative: NarrativeSchema

    model_config = ConfigDict(arbitrary_types_allowed=True)
