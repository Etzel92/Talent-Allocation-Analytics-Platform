import axios from 'axios';
import { getToken } from '../../features/auth/session';

let onUnauthorized: null | (() => void) = null;
let onActivity: null | (() => void) = null;   // ⬅️ nuevo
let handling401 = false;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

api.interceptors.request.use((config) => {
  onActivity?.(); // ⬅️ cualquier request cuenta como actividad
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => {
    onActivity?.(); // ⬅️ cualquier respuesta también
    return r;
  },
  (err) => {
    onActivity?.();
    if (err?.response?.status === 401 && onUnauthorized && !handling401) {
      handling401 = true;
      try { onUnauthorized(); } finally { handling401 = false; }
    }
    return Promise.reject(err);
  },
);

export function setUnauthorizedHandler(fn: () => void) { onUnauthorized = fn; }
export function setActivityHandler(fn: () => void) { onActivity = fn; }  // ⬅️ nuevo

export default api;
