import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchQuestions,
  fetchQuestionById,
  createQuestion,
  updateAnswerState,
  createAnswer,
  updateQuestion,
  deleteQuestion,
} from "./api";
import type {
  Question,
  CreateQuestionDto,
  CreateAnswerDto,
  Answer,
  UpdateQuestionDto,
} from "./types";
export type QuestionsFilters = {
  limit?: number;
};

export const useQuestionsInfinite = (filters: QuestionsFilters = {}) => {
  const { limit = 20 } = filters;

  return useInfiniteQuery({
    queryKey: ["questions", "infinite", { limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchQuestions({
        page: pageParam as number,
        limit,
      }),
    getNextPageParam: (last) =>
      last.hasMore ? last.nextPage ?? last.page + 1 : undefined,
  });
};

export const useQuestion = (id: number) => {
  return useQuery<Question, Error>({
    queryKey: ["questions", "byId", id],
    queryFn: () => fetchQuestionById(id),
    enabled: Number.isFinite(id),
  });
};

export const useCreateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuestionDto) => createQuestion(dto),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["questions", "infinite"] });
      qc.setQueryData(["questions", "byId", created.id], created as Question);
    },
  });
};

export const useCreateAnswer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAnswerDto) => createAnswer(dto),
    onSuccess: (created: Answer, vars) => {
      const key = ["questions", "byId", vars.questionId];
      const prev = qc.getQueryData<Question>(key);
      if (prev) {
        const next: Question = {
          ...prev,
          answers: [...prev.answers, created],
          answersCount: (prev.answersCount ?? prev.answers.length ?? 0) + 1,
        };
        qc.setQueryData(key, next);
      }
      qc.invalidateQueries({ queryKey: ["questions", "infinite"] });
    },
  });
};

type MarkAnswerStateVars = {
  questionId: number;
  answerId: number;
  state: "correct" | "incorrect";
};

export const useMarkAnswerState = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, state }: MarkAnswerStateVars) =>
      updateAnswerState(answerId, state),
    onMutate: async ({ questionId, answerId, state }) => {
      await qc.cancelQueries({ queryKey: ["questions", "byId", questionId] });
      const prev = qc.getQueryData<Question>(["questions", "byId", questionId]);

      if (prev) {
        const nextAnswers = prev.answers.map((answer) => {
          if (answer.id === answerId) {
            return { ...answer, isCorrect: state === "correct" };
          }

          if (state === "correct") {
            return { ...answer, isCorrect: false };
          }
          return answer;
        });

        const nextResolved = nextAnswers.some((answer) => answer.isCorrect);

        const next: Question = {
          ...prev,
          answers: nextAnswers,
          resolved: nextResolved,
        };

        qc.setQueryData(["questions", "byId", questionId], next);
      }

      return { prev, questionId };
    },

    onError: (_err, vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["questions", "byId", ctx.questionId], ctx.prev);
      }
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({
        queryKey: ["questions", "byId", vars.questionId],
      });
      qc.invalidateQueries({ queryKey: ["questions", "infinite"] });
    },
  });
};

export const useUpdateQuestion = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { id: number | string; dto: UpdateQuestionDto }) =>
      updateQuestion(vars.id, vars.dto),

    onSuccess: async (_resp, vars) => {
      await Promise.allSettled([
        qc.invalidateQueries({
          queryKey: ["questions", "byId", Number(vars.id)],
        }),
        qc.invalidateQueries({ queryKey: ["questions", "infinite"] }),
      ]);
    },
  });
};

export const useDeleteQuestion = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number | string }) => deleteQuestion(id),
    onSuccess: async (_deleted) => {
      await Promise.allSettled([
        qc.invalidateQueries({ queryKey: ["questions"], exact: false }),
        qc.invalidateQueries({ queryKey: ["questions", "infinite"] }),
      ]);
    },
  });
};
