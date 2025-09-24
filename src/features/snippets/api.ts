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
import { API_BASE_URL } from "@/shared/api/config";



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
  const url = new URL(`${API_BASE_URL}/snippets`, window.location.origin);
  url.searchParams.set("page", String(page));
  if (limit != null) url.searchParams.set("limit", String(limit));
  if (userId != null) url.searchParams.set("userId", String(userId));
  if (Array.isArray(sortBy)) {
    sortBy.forEach((sortField) => url.searchParams.append("sortBy", sortField));
  }

  const res = await fetch(url.toString(), { credentials: import.meta.env.DEV ? "include" : "omit", signal });
  if (!res.ok)
    throw new Error(`Failed to load snippets (status ${res.status})`);

  const raw = await res.json();
  const api = unwrapSnippetsApiResponse(raw);

  const items = api.data.map(mapApiSnippetToDomainSnippet);
  const {
    itemsPerPage: pageSize,
    currentPage,
    totalItems,
    totalPages,
  } = api.meta;
  const hasMore = Boolean(api.links.next) || currentPage < totalPages;

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
  snippetId: number | string
): Promise<Snippet> => {
  const url = new URL(
    `${API_BASE_URL}/snippets/${snippetId}`,
    window.location.origin
  );
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok)
    throw new Error(
      `Failed to load snippet ${snippetId} (status ${res.status})`
    );

  const raw = await res.json();
  const api = unwrapSingleSnippetApiResponse(raw);
  return mapApiSnippetToDomainSnippet(api);
};

export const createSnippet = async (
  payload: CreateSnippetDto
): Promise<ApiSnippet> => {
  const res = await fetch(`${API_BASE_URL}/snippets`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to create snippet (status ${res.status})${
        text ? `: ${text}` : ""
      }`
    );
  }
  const raw = await res.json();
  return unwrap<ApiSnippet>(raw);
};

export const markSnippet = async (
  snippetId: number | string,
  mark: MarkKind
): Promise<unknown> => {
  const res = await fetch(`/api/snippets/${snippetId}/mark`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mark }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to mark snippet (status ${res.status})${text ? `: ${text}` : ""}`
    );
  }
  try {
    return await res.json();
  } catch {
    return { ok: true };
  }
};

export const fetchSnippetLanguages = async (
  signal?: AbortSignal
): Promise<string[]> => {
  const res = await fetch(`/api/snippets/languages`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Failed to load languages (status ${res.status})`);
  }
  const raw = await res.json();
  const data = unwrap<string[]>(raw);

  if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
    return data;
  }
  throw new Error("Unexpected API response shape for /snippets/languages");
};

export const updateSnippet = async (
  snippetId: number | string,
  payload: UpdateSnippetDto
): Promise<UpdateSnippetResponse> => {
  const res = await fetch(`${API_BASE_URL}/snippets/${snippetId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to update snippet ${snippetId} (status ${res.status})${
        text ? `: ${text}` : ""
      }`
    );
  }

  const raw = await res.json();
  return unwrap<UpdateSnippetResponse>(raw);
};

export const deleteSnippet = async (
  snippetId: number | string
): Promise<ApiSnippet> => {
  const res = await fetch(`${API_BASE_URL}/snippets/${snippetId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to delete snippet ${snippetId} (status ${res.status})${
        text ? `: ${text}` : ""
      }`
    );
  }

  const raw = await res.json();
  return unwrap<ApiSnippet>(raw);
};