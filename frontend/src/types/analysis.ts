export interface Profile {
  rows: number;
  columns: number;
  missing_cells: number;
  missing_percent: number;
  duplicate_rows: number;
  numeric_columns: string[];
  categorical_columns: string[];
  datetime_columns: string[];
  column_types: Record<string, string>;
  sample_rows?: Record<string, unknown>[];
}

export interface KPIs {
  accuracy?: number;
  r2?: number;
  rmse?: number;
  mae?: number;
  silhouette_score?: number;
  n_clusters?: number;
  n_anomalies?: number;
  anomaly_rate?: number;
  top_feature?: string;
  top_feature_importance?: number;
  [key: string]: number | string | undefined;
}

export interface Chart {
  id: string;
  title: string;
  type: 'scatter' | 'bar' | 'line' | 'pie' | 'heatmap' | 'box' | 'histogram' | 'surface';
  plotly_json: string;
  description?: string;
  tab: 'visualization' | 'prediction' | 'segments' | 'anomalies' | 'factors';
}

export interface AnalysisResult {
  id?: string;
  filename: string;
  target_column?: string;
  created_at?: string;
  profile: Profile;
  kpis: KPIs;
  charts: Chart[];
  narrative: string;
  data_quality_score: number;
  model_used?: string;
  prediction_narrative?: string;
  segments_narrative?: string;
  anomalies_narrative?: string;
  factors_narrative?: string;
  full_report?: string;
}
