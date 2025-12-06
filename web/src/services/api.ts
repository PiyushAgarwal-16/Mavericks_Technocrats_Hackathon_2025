import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Configure backend URL - can be overridden via environment variable
// Default to Railway production URL if not set (for Vercel deployment)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://maverickstechnocratshackathon2025-production.up.railway.app';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// JWT interceptor - automatically adds token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Certificate {
  _id: string;
  wipeId: string;
  userId: string;
  deviceModel: string;
  serialNumber?: string;
  method: string;
  timestamp: string;
  logHash: string;
  signature: string;
  uploaded: boolean;
  createdAt: string;
}

export interface WipeLog {
  _id: string;
  wipeId: string;
  rawLog: string;
  devicePath: string;
  duration: number;
  exitCode: number;
}

export interface VerificationResult {
  verified: boolean;
  signatureValid: boolean;
  logHashMatches: boolean;
  certificate: Certificate;
  wipeLog?: WipeLog;
  user?: User;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
}

// API methods
export const api = {
  // Authentication
  auth: {
    register: async (email: string, password: string): Promise<RegisterResponse> => {
      const response = await apiClient.post('/auth/register', { email, password });
      return response.data;
    },

    login: async (email: string, password: string): Promise<LoginResponse> => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    },
  },

  // Certificates
  certificates: {
    create: async (data: {
      deviceModel: string;
      serialNumber?: string;
      method: string;
      timestamp: string;
      rawLog: string;
      devicePath: string;
      duration: number;
      exitCode: number;
    }): Promise<{
      wipeId: string;
      verificationUrl: string;
      signature: string;
      logHash: string;
    }> => {
      const response = await apiClient.post('/certificates', data);
      return response.data;
    },

    validate: async (wipeId: string): Promise<{
      valid: boolean;
      exists: boolean;
      uploaded?: boolean;
      reason?: string;
      message: string;
      createdAt?: string;
    }> => {
      const response = await apiClient.get(`/certificates/validate/${wipeId}`);
      return response.data;
    },

    verify: async (wipeId: string): Promise<VerificationResult> => {
      const response = await apiClient.get(`/certificates/${wipeId}`);
      return response.data;
    },

    getUserCertificates: async (): Promise<Certificate[]> => {
      const response = await apiClient.get('/certificates/user/me');
      return response.data;
    },

    getAllCertificates: async (): Promise<Certificate[]> => {
      const response = await apiClient.get('/certificates/admin/all');
      return response.data;
    },
  },
};

export default apiClient;
