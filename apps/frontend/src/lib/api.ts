import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { usePrivacyStore } from '../store/privacy.store';

export const api = axios.create({
  baseURL: '/api',
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
