import axios from 'axios';

export const resolveBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('recruitiq_backend_url');
    if (saved && saved.trim()) {
      let cleaned = saved.trim();
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        cleaned = `https://${cleaned}`;
      }
      return cleaned.replace(/\/$/, '');
    }
  }

  let envUrl = import.meta.env.VITE_API_URL || '';
  if (envUrl && envUrl.trim()) {
    let cleaned = envUrl.trim();
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `https://${cleaned}`;
    }
    return cleaned.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com')) {
      const backendHost = host.replace('recruitiq-frontend', 'recruitiq-backend');
      return `https://${backendHost}`;
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  return '';
};

export const getApiBase = (): string => {
  const backend = resolveBackendUrl();
  return backend ? `${backend}/api` : '/api';
};

const api = axios.create({
  baseURL: getApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Intercept requests to dynamically update baseURL and attach token
api.interceptors.request.use((config) => {
  config.baseURL = getApiBase();
  const token = localStorage.getItem('recruitiq_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for unified error message extraction
api.interceptors.response.use(
  (response) => {
    // Detect static server returning index.html for API routes
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype html>')) {
      return Promise.reject(new Error('Backend API endpoint returned HTML. Server may be sleeping or backend URL is incorrect.'));
    }
    return response;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.status === 404) {
      const currentUrl = getApiBase();
      message = `Cannot reach backend API (404 Not Found at ${currentUrl}). Make sure your Render backend URL is configured.`;
    } else if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        message = error.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      if (error.message.includes('Network Error')) {
        message = 'Cannot connect to backend server. Render free instances sleep when inactive and may take up to 50 seconds to wake up.';
      } else {
        message = error.message;
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const testBackendHealth = async (customUrl?: string): Promise<{ success: boolean; message: string }> => {
  const target = (customUrl || resolveBackendUrl()).replace(/\/$/, '');
  if (!target) {
    return { success: false, message: 'No backend URL specified.' };
  }
  try {
    const res = await axios.get(`${target}/health`, { timeout: 15000 });
    if (res.status === 200 && res.data?.status === 'healthy') {
      return { success: true, message: 'Backend connected successfully! (Status: healthy)' };
    }
    return { success: true, message: `Connected with status code ${res.status}` };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.status
        ? `Server responded with status ${err.response.status}`
        : (err.message || 'Connection failed')
    };
  }
};

export default api;
