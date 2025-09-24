import { apiAuth } from "@/shared/api/axios";
import type { User } from "./model/store";

export const loginApi = async (payload: {
  username: string;
  password: string;
}) => {
  const { data } = await apiAuth.post<User>("/auth/login", payload);
  return data;
};

export const logoutApi = async () => {
  await apiAuth.post("/auth/logout");
};

export type RegisterPayload = { username: string; password: string };

export const registerApi = async (payload: RegisterPayload) => {
  await apiAuth.post("/register", payload);
};
