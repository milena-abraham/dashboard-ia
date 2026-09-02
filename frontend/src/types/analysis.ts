export interface ProfileSchema {
  nRows: number;
  nCols: number;
  qualityScore: number;
  qualityLabel: string;
  numericColumns: string[];
  dateColumns: string[];
  categoricalColumns: string[];
  suggestedTargets: string[];
}

export interface CleaningReportSchema {
  actions: string[];
  duplicatesRemoved: number;
  nullsImputed: Record<string, number>;
}

export interface ChartMetadataSchema {
  title: string;
  insightSubtitle: string;
  sourceMetric: string;
}

export interface LayoutDirectivesSchema {
  chartType: string;
  xAxisType: string;
  yAxisType: string;
  isLogScale: boolean;
  hasTimeGaps: boolean;
  highCardinality: boolean;
  showConfidenceBands: boolean;
}

export interface DatasetSchema {
  dimensions: string[];
  source: Record<string, any>[];
}

export interface ChartSchema {
  chartId: string;
  metadata: ChartMetadataSchema;
  layoutDirectives: LayoutDirectivesSchema;
  dataset: DatasetSchema;
}

export interface ForecastMetricsSchema {
  ultimoValorReal?: number;
  valorFinalForecast?: number;
  tendenciaPct?: number;
  periodos?: number;
  motor?: string;
  mae?: number;
  mape?: number;
  confianza?: string;
  validacion?: string;
  error?: string;
}

export interface ForecastSchema {
  chartData?: ChartSchema;
  metrics: ForecastMetricsSchema;
}

export interface SegmentationMetricsSchema {
  k?: number;
  varianzaExplicadaPca?: number;
  distribucion?: Record<string, number>;
  perfil?: Record<string, any>[];
  error?: string;
}

export interface SegmentationSchema {
  scatterData?: ChartSchema;
  radarData?: ChartSchema;
  metrics: SegmentationMetricsSchema;
}

export interface AnomalyMetricsSchema {
  nAnomalias?: number;
  pctAnomalias?: number;
  anomaliasDetalle?: string[];
  error?: string;
}

export interface AnomaliesSchema {
  chartData?: ChartSchema;
  metrics: AnomalyMetricsSchema;
}

export interface FeatureImportanceMetricsSchema {
  topFeatures?: Record<string, any>[];
  shapSummary?: Record<string, number>;
  nFeatures?: number;
  shapDisponible?: boolean;
  error?: string;
}

export interface FeatureImportanceSchema {
  chartImportance?: ChartSchema;
  chartShap?: ChartSchema;
  metrics: FeatureImportanceMetricsSchema;
}

export interface NarrativeSchema {
  text?: string;
  source?: string;
}

export interface AnalysisResponseSchema {
  filename: string;
  targetCol?: string;
  profile: ProfileSchema;
  cleaningReport: CleaningReportSchema;
  kpis: Record<string, any>;
  charts: ChartSchema[];
  forecast: ForecastSchema;
  segmentation: SegmentationSchema;
  anomalies: AnomaliesSchema;
  featureImportance: FeatureImportanceSchema;
  narrative: NarrativeSchema;
}
