import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Prediction,
  PredictionListResponse,
  AdminStats,
  HealthStatus,
  PancreaticPrediction,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('braintumorai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('braintumorai_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Prediction endpoints
export const predictionsApi = {
  uploadAndPredict: async (file: File): Promise<Prediction> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Prediction>('/predictions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPredictions: async (
    page: number = 1,
    perPage: number = 10,
    classFilter?: string,
    search?: string
  ): Promise<PredictionListResponse> => {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (classFilter && classFilter !== 'all') params.class_filter = classFilter;
    if (search) params.search = search;
    const response = await api.get<PredictionListResponse>('/predictions', { params });
    return response.data;
  },

  getPrediction: async (id: number): Promise<Prediction> => {
    const response = await api.get<Prediction>(`/predictions/${id}`);
    return response.data;
  },

  deletePrediction: async (id: number): Promise<void> => {
    await api.delete(`/predictions/${id}`);
  },

  downloadReport: async (id: number): Promise<Blob> => {
    const response = await api.get(`/predictions/${id}/report`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Admin endpoints
export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/admin/statistics');
    return response.data;
  },

  getModelMetrics: async (): Promise<Record<string, unknown>> => {
    const response = await api.get('/admin/model-metrics');
    return response.data;
  },
};

// Health endpoint
export const healthApi = {
  getHealth: async (): Promise<HealthStatus> => {
    const response = await api.get<HealthStatus>('/health');
    return response.data;
  },
};

export const pancreaticApi = {
  uploadAndPredict: async (file: File): Promise<PancreaticPrediction> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<PancreaticPrediction>('/pancreatic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getPrediction: async (id: number): Promise<PancreaticPrediction> => {
    const response = await api.get<PancreaticPrediction>(`/pancreatic/${id}`);
    return response.data;
  },
};

export default api;
