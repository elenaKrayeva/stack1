import type {
  ApiQuestion,
  ApiQuestionsResponse,
  Question,
  QuestionsPageResult,
  CreateQuestionDto,
  CreateAnswerDto,
  Answer,
  ApiAnswer,
  UpdateQuestionDto,
  UpdateQuestionResponse,
} from "./types";
import {
  mapApiQuestionToDomainQuestion,
  mapApiAnswerToDomainAnswer,
} from "./mappers";
import { unwrap } from "@/shared/api/unwrap";
import { apiAuth } from "@/shared/api/axios";

const ok = (s: number) => s >= 200 && s < 300;

export type FetchQuestionsParameters = {
  page?: number;
  limit?: number;
};

export const fetchQuestions = async (
  parameters: FetchQuestionsParameters = {}
): Promise<QuestionsPageResult> => {
  const { page = 1, limit } = parameters;

  const q = new URLSearchParams();
  q.set("page", String(page));
  if (limit != null) q.set("limit", String(limit));

  const res = await apiAuth.get(`/questions?${q.toString()}`, {
    validateStatus: () => true,
  });
  if (!ok(res.status)) {
    throw new Error(`Failed to load questions (status ${res.status})`);
  }

  const api = unwrap<ApiQuestionsResponse>(res.data);
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
  const res = await apiAuth.get(`/questions/${questionId}`, {
    validateStatus: () => true,
  });
  if (!ok(res.status)) {
    throw new Error(
      `Failed to load question ${questionId} (status ${res.status})`
    );
  }

  const apiQuestion = unwrap<ApiQuestion>(res.data);
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
  const res = await apiAuth.post(`/questions`, payload, {
    validateStatus: () => true,
  });
  if (!ok(res.status)) {
    const text = typeof res.data === "string" ? res.data : "";
    throw new Error(
      `Failed to create question (status ${res.status}) ${text ?? ""}`
    );
  }

  const apiQuestion = unwrap<ApiQuestion>(res.data);
  if (!apiQuestion || (apiQuestion as any).id == null) {
    throw new Error("Unexpected API response shape for POST /questions");
  }
  return mapApiQuestionToDomainQuestion(apiQuestion);
};

export const createAnswer = async (
  payload: CreateAnswerDto
): Promise<Answer> => {
  const res = await apiAuth.post(`/answers`, payload, {
    validateStatus: () => true,
  });
  if (!ok(res.status)) {
    const text = typeof res.data === "string" ? res.data : "";
    throw new Error(
      `Failed to create answer (status ${res.status}) ${text ?? ""}`
    );
  }

  const apiAnswer = unwrap<ApiAnswer>(res.data);
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
  const res = await apiAuth.put(
    `/answers/${answerId}/state/${state}`,
    undefined,
    {
      validateStatus: () => true,
    }
  );
  if (!ok(res.status)) {
    const text = typeof res.data === "string" ? res.data : "";
    throw new Error(
      `Failed to update answer state (status ${res.status}) ${text ?? ""}`
    );
  }
};

export const updateQuestion = async (
  questionId: number | string,
  payload: UpdateQuestionDto
): Promise<UpdateQuestionResponse> => {
  const res = await apiAuth.patch(`/questions/${questionId}`, payload, {
    validateStatus: () => true,
  });
  if (!ok(res.status)) {
    const text = typeof res.data === "string" ? res.data : "";
    throw new Error(
      `Failed to update question ${questionId} (status ${res.status})${
        text ? `: ${text}` : ""
      }`
    );
  }

  return unwrap<UpdateQuestionResponse>(res.data);
};

export const deleteQuestion = async (
  questionId: number | string
): Promise<ApiQuestion> => {
  const res = await apiAuth.delete(`/questions/${questionId}`, {
    validateStatus: () => true,
  });
  if (!ok(res.status)) {
    const text = typeof res.data === "string" ? res.data : "";
    throw new Error(
      `Failed to delete question ${questionId} (status ${res.status})${
        text ? `: ${text}` : ""
      }`
    );
  }
  return unwrap<ApiQuestion>(res.data);
};
