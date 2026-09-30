import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const trimSlash = (url) => url.replace(/\/+$/, '');

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const hasEnvUrl = envUrl && envUrl !== 'undefined';

  // In development, always go through the Vite dev-server proxy (see vite.config.js).
  // A same-origin relative URL works from localhost, a LAN IP or a phone, whereas
  // "http://localhost:5000" only works on the machine running the backend.
  if (import.meta.env.DEV) {
    return '/api';
  }

  if (hasEnvUrl && !envUrl.includes('localhost')) {
    return trimSlash(envUrl);
  }

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    // If frontend is merbolo-stationery-store-1.onrender.com, backend is merbolo-stationery-store.onrender.com
    const backendHost = window.location.hostname.replace(/-\d+\.onrender\.com$/, '.onrender.com');
    return `https://${backendHost}/api`;
  }

  // Production build without a usable VITE_API_URL: assume the API is served from the same origin
  // rather than pointing visitors' browsers at their own localhost.
  if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    console.warn('[api] VITE_API_URL is not set for this build; falling back to same-origin /api');
    return '/api';
  }

  return hasEnvUrl ? trimSlash(envUrl) : 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

const client = axios.create({
  baseURL: API_URL,
  // Free-tier hosts (e.g. Render) can take ~50s to wake from sleep
  timeout: 60000,
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

const NETWORK_ERROR_MESSAGE =
  'Unable to reach the server. It may be starting up — please wait a moment and try again.';

// Normalize API response and errors
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config } = error;

    // Connection failed outright (server asleep, restarting or unreachable): retry once before giving up.
    // Timeouts are not retried, since the server may already have processed the request.
    if (error.code === 'ERR_NETWORK' && config && !config.__retried) {
      config.__retried = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return client(config);
    }

    if (!error.response) {
      console.error(`[api] Could not reach ${API_URL}:`, error.message);
    }

    const message =
      error.response?.data?.message ||
      (!error.response ? NETWORK_ERROR_MESSAGE : error.message) ||
      'An unexpected error occurred';
    const errors = error.response?.data?.errors || [];
    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

export default client;
