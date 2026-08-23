// User types
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Prediction types
export interface Prediction {
  id: number;
  original_filename: string;
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  gradcam_url: string | null;
  processing_time_ms: number;
  model_version: string;
  image_url: string;
  created_at: string;
}

export interface PredictionListResponse {
  predictions: Prediction[];
  total: number;
  page: number;
  per_page: number;
}

// Admin types
export interface SystemStats {
  total_predictions: number;
  predictions_today: number;
  total_users: number;
  active_model: string;
  model_version: string;
}

export interface PredictionDistribution {
  class_name: string;
  count: number;
  percentage: number;
}

export interface AdminStats {
  stats: SystemStats;
  distribution: PredictionDistribution[];
  recent_predictions: Prediction[];
}

// Health
export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  database: string;
  version: string;
}

// Class color mapping
export const CLASS_COLORS: Record<string, string> = {
  glioma: '#f43f5e',
  meningioma: '#f59e0b',
  pituitary: '#3b82f6',
  notumor: '#10b981',
};

export const CLASS_LABELS: Record<string, string> = {
  glioma: 'Glioma',
  meningioma: 'Meningioma',
  pituitary: 'Pituitary Tumor',
  notumor: 'No Tumor',
};

// Pancreatic Cancer types
export interface PancreaticPrediction {
  id: number;
  original_filename: string;
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  processing_time_ms: number;
  model_version: string;
  image_url: string;
  model_metrics: ModelMetrics;
  created_at: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  specificity: number;
}

export const PANCREATIC_CLASS_COLORS: Record<string, string> = {
  cancer: '#f43f5e',
  no_cancer: '#10b981',
};

export const PANCREATIC_CLASS_LABELS: Record<string, string> = {
  cancer: 'Cancer Detected',
  no_cancer: 'No Cancer',
};
