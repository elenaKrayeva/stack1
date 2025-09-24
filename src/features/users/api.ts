import type {
  ApiUsersResponse,
  ApiUser,
  ApiUserStatistic,
  User,
  UserStatistic,
} from "./types";
import { mapApiUser, mapApiUserStatistic } from "./mappers";
import { unwrap } from "@/shared/api/unwrap";
import { apiAuth } from "@/shared/api/axios";

export type FetchUsersParams = {
  page?: number;
  limit?: number;
  sortBy?: string[];
  search?: string;
  searchBy?: string[];
};

export const fetchUsers = async (params: FetchUsersParams = {}) => {
  const { page = 1, limit, sortBy, search, searchBy } = params;

  const q = new URLSearchParams();
  q.set("page", String(page));
  if (limit != null) q.set("limit", String(limit));
  if (Array.isArray(sortBy)) sortBy.forEach((s) => q.append("sortBy", s));
  if (search && search.trim()) q.set("search", search.trim());
  if (Array.isArray(searchBy)) searchBy.forEach((f) => q.append("searchBy", f));

  const res = await apiAuth.get(`/users?${q.toString()}`, {
    validateStatus: () => true,
  });
  if (!(res.status >= 200 && res.status < 300)) {
    throw new Error(`Failed to load users (status ${res.status})`);
  }

  const api = unwrap<ApiUsersResponse>(res.data);
  if (!api || !Array.isArray(api.data) || !api.meta || !api.links) {
    throw new Error(
      "Unexpected API response shape for /users (expected { data[], meta, links })"
    );
  }

  const items: User[] = api.data.map(mapApiUser);
  const {
    itemsPerPage: pageSize,
    currentPage,
    totalItems,
    totalPages,
  } = api.meta;
  const hasMore = Boolean(api.links?.next) || currentPage < totalPages;

  return {
    items,
    page: currentPage,
    pageSize,
    total: totalItems,
    hasMore,
    nextPage: hasMore ? currentPage + 1 : undefined,
  };
};

export const fetchUserById = async (userId: number | string): Promise<User> => {
  const res = await apiAuth.get(`/users/${userId}`, {
    validateStatus: () => true,
  });
  if (!(res.status >= 200 && res.status < 300)) {
    throw new Error(`Failed to load user ${userId} (status ${res.status})`);
  }

  const maybe = unwrap<any>(res.data);
  const apiUser: ApiUser | undefined =
    (maybe?.user as ApiUser) ?? (maybe as ApiUser);
  if (!apiUser || (apiUser as any).id == null) {
    throw new Error(
      "Unexpected API response shape for /users/:id (expected user object)"
    );
  }
  return mapApiUser(apiUser);
};

export const fetchUserStatistic = async (
  userId: number | string
): Promise<UserStatistic> => {
  const res = await apiAuth.get(`/users/${userId}/statistic`, {
    validateStatus: () => true,
  });
  if (!(res.status >= 200 && res.status < 300)) {
    throw new Error(
      `Failed to load user statistic ${userId} (status ${res.status})`
    );
  }

  const unwrapped = unwrap<any>(res.data);
  const statsPayload: ApiUserStatistic | undefined = unwrapped?.statistic;
  if (!statsPayload || typeof statsPayload !== "object") {
    throw new Error(
      "Unexpected API response shape for /users/:id/statistic (expected { statistic })"
    );
  }
  return mapApiUserStatistic(statsPayload);
};
