export interface Profile {
  n_rows: number;
  n_cols: number;
  quality_score: number;
  quality_label: string;
  numeric_columns: string[];
  date_columns: string[];
  categorical_columns: string[];
  suggested_targets: string[];
}

export interface CleaningReport {
  actions: string[];
  duplicates_removed: number;
  nulls_imputed: number;
}

export interface KPIs {
  [key: string]: number | string | undefined;
}

export interface Chart {
  title: string;
  chart_data: any;
  description?: string;
}

export interface MLModelResult {
  chart_data?: any | null;
  scatter_data?: any | null;
  radar_data?: any | null;
  chart_importance?: any | null;
  chart_shap?: any | null;
  metrics: Record<string, any>;
}

export interface Narrative {
  text: string;
  source: string;
}

export interface AnalysisResult {
  filename: string;
  target_col: string;
  target_column?: string;
  profile: Profile;
  cleaning_report: CleaningReport;
  kpis: KPIs;
  charts: Chart[];
  forecast?: MLModelResult;
  segmentation?: MLModelResult;
  anomalies?: MLModelResult;
  feature_importance?: MLModelResult;
  narrative: Narrative;
}
