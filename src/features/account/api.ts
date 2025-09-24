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

export const getMe = async (abortSignal?: AbortSignal): Promise<MeResponse> => {
  const httpResponse = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    signal: abortSignal,
  });
  if (!httpResponse.ok)
    throw new Error(`GET /api/me failed: ${httpResponse.status}`);
  const rawJsonResponse = await httpResponse.json();
  return unwrap<MeResponse>(rawJsonResponse);
};

export const getUserStatistic = async (
  userId: string | number,
  abortSignal?: AbortSignal
): Promise<UserStatistic> => {
  const httpResponse = await fetch(`/api/users/${userId}/statistic`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    signal: abortSignal,
  });
  if (!httpResponse.ok)
    throw new Error(
      `GET /api/users/${userId}/statistic failed: ${httpResponse.status}`
    );
  const rawJsonResponse = await httpResponse.json();
  return unwrap<UserStatistic>(rawJsonResponse);
};

export const deleteMyAccount = async (
  abortSignal?: AbortSignal
): Promise<MeResponse | undefined> => {
  const httpResponse = await fetch("/api/me", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    signal: abortSignal,
  });

  if (!httpResponse.ok) {
    throw new Error(`DELETE /api/me failed: ${httpResponse.status}`);
  }

  if (httpResponse.status === 204) return undefined;

  const rawJsonResponse = await httpResponse.json().catch(() => undefined);
  return rawJsonResponse ? unwrap<MeResponse>(rawJsonResponse) : undefined;
};

export const updateMyUsername = async (
  payload: { username: string },
  abortSignal?: AbortSignal
): Promise<MeResponse> => {
  const httpResponse = await fetch("/api/me", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: abortSignal,
  });
  if (!httpResponse.ok)
    throw new Error(`PATCH /api/me failed: ${httpResponse.status}`);
  const rawJsonResponse = await httpResponse.json();
  return unwrap<MeResponse>(rawJsonResponse);
};

export const updateMyPassword = async (
  payload: { oldPassword: string; newPassword: string },
  abortSignal?: AbortSignal
): Promise<void> => {
  const httpResponse = await fetch("/api/me/password", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: abortSignal,
  });
  if (!httpResponse.ok)
    throw new Error(`PATCH /api/me/password failed: ${httpResponse.status}`);
};
