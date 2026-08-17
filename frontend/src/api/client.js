import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== 'undefined' && !envUrl.includes('localhost')) {
    return envUrl;
  }

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    // If frontend is merbolo-stationery-store-1.onrender.com, backend is merbolo-stationery-store.onrender.com
    const backendHost = window.location.hostname.replace(/-\d+\.onrender\.com$/, '.onrender.com');
    return `https://${backendHost}/api`;
  }

  return envUrl || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from authStore to request header
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize API response and errors
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const errors = error.response?.data?.errors || [];
    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

export default client;
