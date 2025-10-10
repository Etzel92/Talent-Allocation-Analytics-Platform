import axios from 'axios';
import { getToken } from '../../features/auth/session';

let onUnauthorized: null | (() => void) = null;
let handling401 = false;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

// Adjunta Authorization si hay token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401 → dispara logout una sola vez
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && onUnauthorized && !handling401) {
      handling401 = true;
      try { onUnauthorized(); } finally { handling401 = false; }
    }
    return Promise.reject(err);
  },
);

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export default api;
