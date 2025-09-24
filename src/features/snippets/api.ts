import type {
  ApiSnippetsResponse,
  SnippetsPage,
  Snippet,
  ApiSnippet,
  CreateSnippetDto,
} from "./types";
import { mapApiSnippetToDomainSnippet } from "./mappers";
import { unwrap } from "@/shared/api/unwrap";
import type {
  MarkKind,
  UpdateSnippetDto,
  UpdateSnippetResponse,
} from "./types";
import { api, apiAuth } from "@/shared/api/axios";

const unwrapSnippetsApiResponse = (raw: unknown): ApiSnippetsResponse => {
  const envelope = raw as { data: ApiSnippetsResponse };
  if (
    envelope &&
    envelope.data &&
    Array.isArray(envelope.data.data) &&
    envelope.data.meta &&
    envelope.data.links
  )
    return envelope.data;

  const maybe = unwrap<ApiSnippetsResponse>(raw);
  if (maybe && Array.isArray(maybe.data) && maybe.meta && maybe.links)
    return maybe;

  throw new Error("Unexpected API response shape for /snippets");
};

const unwrapSingleSnippetApiResponse = (raw: unknown): ApiSnippet => {
  const envelope = raw as { data: ApiSnippet };
  if (envelope && envelope.data && (envelope.data as any).id != null)
    return envelope.data;

  const maybe = unwrap<ApiSnippet>(raw);
  if (maybe && (maybe as any).id != null) return maybe;

  throw new Error("Unexpected API response shape for /snippets/{id}");
};

//Public (no cookies)

type FetchSnippetsParameters = {
  page?: number;
  limit?: number;
  userId?: number | string;
  sortBy?: string[];
};

export const fetchSnippets = async (
  { page = 1, limit, userId, sortBy }: FetchSnippetsParameters = {},
  signal?: AbortSignal
): Promise<SnippetsPage> => {
  const q = new URLSearchParams();
  q.set("page", String(page));
  if (limit != null) q.set("limit", String(limit));
  if (userId != null) q.set("userId", String(userId));
  if (Array.isArray(sortBy)) sortBy.forEach((s) => q.append("sortBy", s));

  const { data: raw } = await api.get(`/snippets?${q.toString()}`, { signal });
  const apiResp = unwrapSnippetsApiResponse(raw);

  const items = apiResp.data.map(mapApiSnippetToDomainSnippet);
  const {
    itemsPerPage: pageSize,
    currentPage,
    totalItems,
    totalPages,
  } = apiResp.meta;

  const hasMore = Boolean(apiResp.links.next) || currentPage < totalPages;

  return {
    items,
    page: currentPage,
    pageSize,
    total: totalItems,
    hasMore,
    nextPage: hasMore ? currentPage + 1 : undefined,
  };
};

export const fetchSnippetById = async (
  snippetId: number | string,
  signal?: AbortSignal
): Promise<Snippet> => {
  const { data: raw } = await api.get(`/snippets/${snippetId}`, { signal });
  const apiResp = unwrapSingleSnippetApiResponse(raw);
  return mapApiSnippetToDomainSnippet(apiResp);
};

//Private (with cookies)

export const createSnippet = async (
  payload: CreateSnippetDto
): Promise<ApiSnippet> => {
  const { data: raw } = await apiAuth.post(`/snippets`, payload);
  return unwrap<ApiSnippet>(raw);
};

export const markSnippet = async (
  snippetId: number | string,
  mark: MarkKind
): Promise<unknown> => {
  const { data } = await apiAuth.post(`/snippets/${snippetId}/mark`, { mark });
  return data ?? { ok: true };
};

export const updateSnippet = async (
  snippetId: number | string,
  payload: UpdateSnippetDto
): Promise<UpdateSnippetResponse> => {
  const { data: raw } = await apiAuth.patch(`/snippets/${snippetId}`, payload);
  return unwrap<UpdateSnippetResponse>(raw);
};

export const deleteSnippet = async (
  snippetId: number | string
): Promise<ApiSnippet> => {
  const { data: raw } = await apiAuth.delete(`/snippets/${snippetId}`);
  return unwrap<ApiSnippet>(raw);
};

export const fetchSnippetLanguages = async (
  signal?: AbortSignal
): Promise<string[]> => {
  const { data: raw } = await apiAuth.get(`/snippets/languages`, {
    signal,
    validateStatus: (s) => s >= 200 && s < 300,
  });

  const data = unwrap<string[]>(raw);
  if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
    return data;
  }
  throw new Error("Unexpected API response shape for /snippets/languages");
};
