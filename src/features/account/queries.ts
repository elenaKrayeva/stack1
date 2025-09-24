import { useQuery } from "@tanstack/react-query";
import { getMe, getUserStatistic, type MeResponse, type UserStatistic } from "./api";

export const queryKeys = {
  me: ["me"] as const,
  stats: (id?: string | number | null) => ["users", String(id ?? "unknown"), "statistic"] as const,
};

export const useMeQuery = (enabled = true) => {
  return useQuery<MeResponse>({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => getMe(signal),
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}

export const useUserStatisticQuery = (userId?: string | number | null) => {
  return useQuery<UserStatistic>({
    queryKey: queryKeys.stats(userId ?? null),
    queryFn: ({ signal }) => getUserStatistic(userId as string | number, signal),
    enabled: userId !== undefined && userId !== null && String(userId).length > 0,
    staleTime: 60_000,
    retry: 1,
  });
}
