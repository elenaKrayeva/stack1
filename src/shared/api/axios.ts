import axios from 'axios';
import { API_BASE_URL } from './config';
import { useAuthStore } from '@/features/auth/model/store';


export const api = axios.create({
  baseURL: API_BASE_URL,
});


export const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


apiAuth.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        const base = import.meta.env.BASE_URL ?? '/';
        const ret = encodeURIComponent(location.pathname + location.search);
        window.location.href = `${base}login?from=${ret}`;
      }
    }
    return Promise.reject(err);
  }
);
