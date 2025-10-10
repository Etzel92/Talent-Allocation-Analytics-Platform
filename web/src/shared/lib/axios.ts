import axios from 'axios';

let onUnauthorized: null | (() => void) = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && onUnauthorized) onUnauthorized();
    return Promise.reject(err);
  },
);

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export default api;