export type SnippetId = number;

export interface ApiUser {
  id: number;
  username: string;
  role: string;
}

export interface ApiSnippet {
  id: number | string;
  language: string;
  code: string;
  user: ApiUser;
  marks?: Array<{ id: string | number; type: "like" | "dislike" }>;
  comments?: Array<unknown>;
}

export interface ApiMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface ApiLinks {
  first: string | null;
  previous: string | null;
  current: string | null;
  next: string | null;
  last: string | null;
}

export interface ApiSnippetsResponse {
  data: ApiSnippet[];
  meta: ApiMeta;
  links: ApiLinks;
}
export type SnippetComment = {
  id: number;
  content: string;
  author: { id: number; username: string; role?: string };
  createdAt?: string;
};
export interface Snippet {
  id: SnippetId;
  language: string;
  code: string;
  author: { id: number; username: string };
  likes: number;
  dislikes: number;
  commentsCount: number;
  comments?: SnippetComment[];
}

export interface SnippetsPage {
  items: Snippet[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  nextPage?: number;
}

export type CreateSnippetDto = {
  code: string;
  language: string;
};

export type MarkKind = "like" | "dislike";

export type CreateMarkDto = {
  mark: MarkKind; 
};

export type UpdateSnippetDto = {
  code: string;
  language: string;
};

export type UpdateSnippetResponse = {
  updatedCount: number;
};
