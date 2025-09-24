import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchUserById, fetchUserStatistic } from "./api";
import type { User, UserStatistic } from "./types";

export type UsersFilters = {
  limit?: number;
  sortBy?: string[];
  search?: string;
  searchBy?: string[];
};

export const useUsersInfinite = (filters: UsersFilters = {}) => {
  const { limit = 20, sortBy = ["username:ASC"], search, searchBy } = filters;

  return useInfiniteQuery({
    queryKey: ["users", "infinite", { limit, sortBy, search, searchBy }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchUsers({
        page: pageParam as number,
        limit,
        sortBy,
        search,
        searchBy,
      }),
    getNextPageParam: (last) =>
      last.hasMore ? last.nextPage ?? last.page + 1 : undefined,
  });
};

export const useUser = (userId: number | string) =>
  useQuery<User, Error>({
    queryKey: ["users", "byId", userId],
    queryFn: () => fetchUserById(userId),
    enabled: userId !== undefined && userId !== null && `${userId}`.length > 0,
  });

export const useUserStatistic = (userId: number | string) =>
  useQuery<UserStatistic, Error>({
    queryKey: ["users", "statistic", userId],
    queryFn: () => fetchUserStatistic(userId),
    enabled: userId !== undefined && userId !== null && `${userId}`.length > 0,
  });
