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
  fig_json: string;
  description?: string;
}

export interface MLModelResult {
  fig_json?: string | null;
  scatter_json?: string | null;
  profile_json?: string | null;
  shap_json?: string | null;
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
