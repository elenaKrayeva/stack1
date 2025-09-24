import { api } from '@/shared/api/axios';
import type { User } from './model/store';

export const loginApi = async (payload: { username: string; password: string }) => {
  const { data } = await api.post<User>('/auth/login', payload);
  return data; 
};

export const logoutApi = async () => {
  await api.post('/auth/logout');
};

export type RegisterPayload = { username: string; password: string };

export const registerApi = async (payload: RegisterPayload) => {
  await api.post('/register', payload);
};


