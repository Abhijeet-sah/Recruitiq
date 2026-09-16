import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || '';

// Auto-detect backend on Render if not explicitly baked in
if (!rawApiUrl && typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host.includes('onrender.com')) {
    const backendHost = host.replace('recruitiq-frontend', 'recruitiq-backend');
    rawApiUrl = `https://${backendHost}`;
  } else if (host === 'localhost' || host === '127.0.0.1') {
    rawApiUrl = 'http://localhost:8000';
  }
}

if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const apiBase = rawApiUrl ? `${rawApiUrl.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Authorization header
api.interceptors.request.use((config) => {
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
      return Promise.reject(new Error('Backend API endpoint returned HTML. Server may be spinning up, please wait a moment and try again.'));
    }
    return response;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        message = error.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      if (error.message.includes('Network Error')) {
        message = 'Cannot connect to backend server. Render free instances may take up to 50 seconds to wake up on the first request.';
      } else {
        message = error.message;
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
