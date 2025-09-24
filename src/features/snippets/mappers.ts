import type { ApiSnippet, Snippet } from "./types";
import { convertToNumber } from "@/shared/utils/number";

export const mapApiSnippetToDomainSnippet = (apiSnippet: ApiSnippet): Snippet => {
  const marks = (apiSnippet as any).marks as
    | Array<{ id: string | number; type: "like" | "dislike" }>
    | undefined;

  const apiComments = (apiSnippet as any).comments as
    | Array<{ id: string | number; content: string; user?: { id?: string|number; username?: string; role?: string }; createdAt?: string }>
    | undefined;

  const likes = Array.isArray(marks) ? marks.filter(m => m.type === "like").length : 0;
  const dislikes = Array.isArray(marks) ? marks.filter(m => m.type === "dislike").length : 0;

  const comments = Array.isArray(apiComments)
    ? apiComments.map(c => ({
        id: convertToNumber(c.id),
        content: c.content,
        author: {
          id: convertToNumber(c.user?.id ?? 0),
          username: c.user?.username ?? "user",
          role: c.user?.role,
        },
        createdAt: c.createdAt,
      }))
    : [];

  return {
    id: convertToNumber(apiSnippet.id as number | string),
    language: apiSnippet.language,
    code: apiSnippet.code,
    author: {
      id: convertToNumber(apiSnippet.user.id),
      username: apiSnippet.user.username,
    },
    likes,
    dislikes,
    commentsCount: comments.length, 
    comments,                    
  };
};
