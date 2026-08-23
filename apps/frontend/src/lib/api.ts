import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { usePrivacyStore } from '../store/privacy.store';

// En développement, Vite redirige `/api` vers le backend local. En production,
// le site statique et l'API ont des domaines différents : Render fournit alors
// l'URL publique du backend au moment du build via VITE_API_URL.
const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (usePrivacyStore.getState().deviceRiskConsent) {
    const key = 'autobroker-device-id';
    const deviceId = localStorage.getItem(key) || crypto.randomUUID();
    localStorage.setItem(key, deviceId);
    config.headers['X-Client-Device'] = deviceId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
