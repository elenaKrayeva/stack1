export type UserRole = "admin" | "user";

type ApiEnvelope<T> = { data: T };

export type MeResponse = {
  id: string | number;
  username: string;
  role: UserRole;
};

export type UserStatistic = {
  id: string | number;
  username: string;
  role: UserRole;
  statistic: {
    snippetsCount: number;
    rating: number;
    commentsCount: number;
    likesCount: number;
    dislikesCount: number;
    questionsCount: number;
    correctAnswersCount: number;
    regularAnswersCount: number;
  };
};

export const unwrap = <T>(rawJsonOrEnvelope: T | ApiEnvelope<T>): T => {
  return rawJsonOrEnvelope &&
    typeof rawJsonOrEnvelope === "object" &&
    "data" in (rawJsonOrEnvelope as Record<string, unknown>)
    ? (rawJsonOrEnvelope as ApiEnvelope<T>).data
    : (rawJsonOrEnvelope as T);
};

import { apiAuth } from "@/shared/api/axios";


export const getMe = async (signal?: AbortSignal): Promise<MeResponse> => {
  const { data: raw } = await apiAuth.get<ApiEnvelope<MeResponse> | MeResponse>(`/me`, { signal });
  return unwrap<MeResponse>(raw);
};


export const getUserStatistic = async (
  userId: string | number,
  signal?: AbortSignal
): Promise<UserStatistic> => {
  const { data: raw } = await apiAuth.get<ApiEnvelope<UserStatistic> | UserStatistic>(
    `/users/${userId}/statistic`,
    { signal }
  );
  return unwrap<UserStatistic>(raw);
};


export const deleteMyAccount = async (
  signal?: AbortSignal
): Promise<MeResponse | undefined> => {
  const res = await apiAuth.delete(`/me`, {
    signal,
    validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
  });

  if (res.status === 204) return undefined;

  return unwrap<MeResponse>(res.data as ApiEnvelope<MeResponse> | MeResponse);
};


export const updateMyUsername = async (
  payload: { username: string },
  signal?: AbortSignal
): Promise<MeResponse> => {
  const { data: raw } = await apiAuth.patch<ApiEnvelope<MeResponse> | MeResponse>(
    `/me`,
    payload,
    { signal }
  );
  return unwrap<MeResponse>(raw);
};


export const updateMyPassword = async (
  payload: { oldPassword: string; newPassword: string },
  signal?: AbortSignal
): Promise<void> => {
  await apiAuth.patch(`/me/password`, payload, { signal });
};
