import type {
  ApiUsersResponse,
  ApiUser,
  ApiUserStatistic,
  User,
  UserStatistic,
} from "./types";
import { mapApiUser, mapApiUserStatistic } from "./mappers";
import { unwrap } from "@/shared/api/unwrap";

const API_BASE_URL = "/api";

export type FetchUsersParams = {
  page?: number;
  limit?: number;
  sortBy?: string[];
  search?: string;
  searchBy?: string[];
};

export const fetchUsers = async (params: FetchUsersParams = {}) => {
  const { page = 1, limit, sortBy, search, searchBy } = params;

  const url = new URL(`${API_BASE_URL}/users`, window.location.origin);
  url.searchParams.set("page", String(page));
  if (limit != null) url.searchParams.set("limit", String(limit));
  if (Array.isArray(sortBy)) sortBy.forEach((sortField) => url.searchParams.append("sortBy", sortField));
  if (search && search.trim()) url.searchParams.set("search", search.trim());
  if (Array.isArray(searchBy)) searchBy.forEach((field) => url.searchParams.append("searchBy", field));

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load users (status ${res.status})`);

  const raw = await res.json();
  const api = unwrap<ApiUsersResponse>(raw);
  if (!api || !Array.isArray(api.data) || !api.meta || !api.links) {
    throw new Error("Unexpected API response shape for /users (expected { data[], meta, links })");
  }

  const items: User[] = api.data.map(mapApiUser);
  const { itemsPerPage: pageSize, currentPage, totalItems, totalPages } = api.meta;
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
  const url = new URL(`${API_BASE_URL}/users/${userId}`, window.location.origin);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load user ${userId} (status ${res.status})`);
  const raw = await res.json();

  const maybe = unwrap<any>(raw);
  const apiUser: ApiUser | undefined = (maybe?.user as ApiUser) ?? (maybe as ApiUser);

  if (!apiUser || (apiUser as any).id == null) {
    throw new Error("Unexpected API response shape for /users/:id (expected user object)");
  }
  return mapApiUser(apiUser);
};

export const fetchUserStatistic = async (userId: number | string): Promise<UserStatistic> => {
  const url = new URL(`${API_BASE_URL}/users/${userId}/statistic`, window.location.origin);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load user statistic ${userId} (status ${res.status})`);

  const raw = await res.json();
  const unwrapped = unwrap<any>(raw); 
  const statsPayload: ApiUserStatistic | undefined = unwrapped?.statistic;

  if (!statsPayload || typeof statsPayload !== "object") {
    throw new Error("Unexpected API response shape for /users/:id/statistic (expected { data: { statistic } })");
  }

  return mapApiUserStatistic(statsPayload);
};
