import type {
  ApiQuestion,
  ApiQuestionsResponse,
  Question,
  QuestionsPageResult,
  CreateQuestionDto,
  CreateAnswerDto,
  Answer,
  ApiAnswer,
  UpdateQuestionDto, UpdateQuestionResponse
} from "./types";
import {
  mapApiQuestionToDomainQuestion,
  mapApiAnswerToDomainAnswer,
} from "./mappers";
import { unwrap } from "@/shared/api/unwrap";
import { API_BASE_URL } from "@/shared/api/config";



export type FetchQuestionsParameters = {
  page?: number;
  limit?: number;
};

export const fetchQuestions = async (
  parameters: FetchQuestionsParameters = {}
): Promise<QuestionsPageResult> => {
  const { page = 1, limit } = parameters;

  const url = new URL(`${API_BASE_URL}/questions`, window.location.origin);
  url.searchParams.set("page", String(page));
  if (limit != null) url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to load questions (status ${res.status})`);
  }

  const raw = await res.json();
  const api = unwrap<ApiQuestionsResponse>(raw);

  if (!api || !Array.isArray(api.data) || !api.meta || !api.links) {
    throw new Error(
      "Unexpected API response shape for /questions (expected { data[], meta, links })"
    );
  }

  const items = api.data.map(mapApiQuestionToDomainQuestion);
  const {
    itemsPerPage: pageSize,
    currentPage,
    totalItems,
    totalPages,
  } = api.meta;
  const hasMorePages = Boolean(api.links.next) || currentPage < totalPages;

  return {
    items,
    page: currentPage,
    pageSize,
    total: totalItems,
    hasMore: hasMorePages,
    nextPage: hasMorePages ? currentPage + 1 : undefined,
  };
};

export const fetchQuestionById = async (
  questionId: number | string
): Promise<Question> => {
  const url = new URL(
    `${API_BASE_URL}/questions/${questionId}`,
    window.location.origin
  );
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw new Error(
      `Failed to load question ${questionId} (status ${res.status})`
    );
  }
  const raw = await res.json();

  const apiQuestion = unwrap<ApiQuestion>(raw);
  if (!apiQuestion || (apiQuestion as any).id == null) {
    throw new Error(
      "Unexpected API response shape for /questions/{id} (expected a question object)"
    );
  }

  return mapApiQuestionToDomainQuestion(apiQuestion);
};

export const createQuestion = async (
  payload: CreateQuestionDto
): Promise<Question> => {
  const url = new URL(`${API_BASE_URL}/questions`, window.location.origin);
  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create question (status ${res.status}) ${text}`);
  }

  const raw = await res.json();
  const apiQuestion = unwrap<ApiQuestion>(raw);

  if (!apiQuestion || (apiQuestion as any).id == null) {
    throw new Error("Unexpected API response shape for POST /questions");
  }
  return mapApiQuestionToDomainQuestion(apiQuestion);
};

export const createAnswer = async (
  payload: CreateAnswerDto
): Promise<Answer> => {
  const url = new URL(`${API_BASE_URL}/answers`, window.location.origin);
  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create answer (status ${res.status}) ${text}`);
  }

  const raw = await res.json();
  const apiAnswer = unwrap<ApiAnswer>(raw);
  const answer = apiAnswer ? mapApiAnswerToDomainAnswer(apiAnswer) : null;

  if (!answer) {
    throw new Error("Unexpected API response shape for POST /answers");
  }
  return answer;
};

export const updateAnswerState = async (
  answerId: number | string,
  state: "correct" | "incorrect"
): Promise<void> => {
  const url = new URL(
    `${API_BASE_URL}/answers/${answerId}/state/${state}`,
    window.location.origin
  );
  const res = await fetch(url.toString(), {
    method: "PUT",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to update answer state (status ${res.status}) ${text}`
    );
  }
};

export const updateQuestion = async (
  questionId: number | string,
  payload: UpdateQuestionDto
): Promise<UpdateQuestionResponse> => {
  const url = new URL(`${API_BASE_URL}/questions/${questionId}`, window.location.origin);
  const res = await fetch(url.toString(), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to update question ${questionId} (status ${res.status})${text ? `: ${text}` : ""}`);
  }

  const raw = await res.json();
  return unwrap<UpdateQuestionResponse>(raw);
};

export const deleteQuestion = async (
  questionId: number | string
): Promise<ApiQuestion> => {
  const url = new URL(`${API_BASE_URL}/questions/${questionId}`, window.location.origin);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to delete question ${questionId} (status ${res.status})${text ? `: ${text}` : ""}`);
  }

  const raw = await res.json();
  return unwrap<ApiQuestion>(raw);
};

