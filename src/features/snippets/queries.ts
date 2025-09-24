import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  fetchSnippets,
  fetchSnippetById,
  markSnippet,
  fetchSnippetLanguages,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from "./api";
import type {
  Snippet,
  ApiSnippet,
  CreateSnippetDto,
  UpdateSnippetDto,
  UpdateSnippetResponse,
} from "./types";
import { useAuthStore } from "@/features/auth/model/store";
import { queryKeys as accountQueryKeys } from "@/features/account/queries";

export type SnippetsFilters = {
  limit?: number;
  userId?: number | string;
  sortBy?: string[];
};

type MarkSnippetVars = {
  id: number | string;
  mark: "like" | "dislike";
  authorId?: number | string;
};

type MarkSnippetContext = {
  prevSnippet?: Snippet;
  snippetKey: QueryKey;
};

export const useSnippetsInfinite = (filters: SnippetsFilters = {}) => {
  const { limit = 20, userId, sortBy } = filters;

  return useInfiniteQuery({
    queryKey: ["snippets", "infinite", { limit, userId, sortBy }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchSnippets({
        page: pageParam as number,
        limit,
        userId,
        sortBy,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage ?? lastPage.page + 1 : undefined,
  });
};

export const useSnippet = (snippetId: number) => {
  return useQuery<Snippet, Error>({
    queryKey: ["snippets", "byId", snippetId],
    queryFn: () => fetchSnippetById(snippetId),
    enabled: Number.isFinite(snippetId),
  });
};

export const useSnippetLanguages = () =>
  useQuery<string[], Error>({
    queryKey: ["snippets", "languages"],
    queryFn: ({ signal }) => fetchSnippetLanguages(signal),
    staleTime: 5 * 60_000,
    retry: 1,
  });

export const useCreateSnippet = () => {
  const qc = useQueryClient();
  return useMutation<ApiSnippet, Error, CreateSnippetDto>({
    mutationFn: (dto) => createSnippet(dto),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["snippets", "infinite"] }),
        qc.invalidateQueries({ queryKey: ["snippets", "feed"] }),
        qc.invalidateQueries({ queryKey: ["snippets", "my"] }),
      ]);
    },
  });
};

export const useMarkSnippet = () => {
  const qc = useQueryClient();

  return useMutation<unknown, Error, MarkSnippetVars, MarkSnippetContext>({
    mutationFn: ({ id, mark }) => markSnippet(id, mark),

    onMutate: async (vars) => {
      const snippetKey: QueryKey = ["snippets", "byId", Number(vars.id)];

      await qc.cancelQueries({ queryKey: snippetKey });

      const prevSnippet = qc.getQueryData<Snippet>(snippetKey);

      if (prevSnippet) {
        const patch: Partial<Snippet> =
          vars.mark === "like"
            ? { likes: (prevSnippet.likes ?? 0) + 1 }
            : { dislikes: (prevSnippet.dislikes ?? 0) + 1 };

        qc.setQueryData<Snippet>(snippetKey, {
          ...prevSnippet,
          ...patch,
        });
      }

      return { prevSnippet, snippetKey };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevSnippet) {
        qc.setQueryData<Snippet>(ctx.snippetKey, ctx.prevSnippet);
      }
    },

    onSettled: async (_data, _err, _vars, ctx) => {
      if (ctx?.snippetKey) {
        await qc.invalidateQueries({ queryKey: ctx.snippetKey });
      }
    },

    onSuccess: async (_data, vars) => {
      const meId = useAuthStore.getState().user?.id;
      const tasks: Array<Promise<unknown>> = [];

      tasks.push(
        qc.invalidateQueries({ queryKey: ["snippets"], exact: false })
      );
      tasks.push(
        qc.invalidateQueries({
          queryKey: ["snippets", "byId", Number(vars.id)],
        })
      );

      if (vars.authorId != null) {
        tasks.push(
          qc.invalidateQueries({
            queryKey: accountQueryKeys.stats(vars.authorId),
          })
        );
      }

      if (meId != null) {
        tasks.push(
          qc.invalidateQueries({ queryKey: accountQueryKeys.stats(meId) })
        );
        tasks.push(qc.invalidateQueries({ queryKey: ["me"] }));
      }

      await Promise.allSettled(tasks);
    },
  });
};

export const useUpdateSnippet = () => {
  const qc = useQueryClient();

  return useMutation<
    UpdateSnippetResponse,
    Error,
    { id: number | string; dto: UpdateSnippetDto }
  >({
    mutationFn: ({ id, dto }) => updateSnippet(id, dto),
    onSuccess: async (_data, vars) => {
      const tasks: Array<Promise<unknown>> = [];
      tasks.push(
        qc.invalidateQueries({
          queryKey: ["snippets", "byId", Number(vars.id)],
        })
      );
      tasks.push(
        qc.invalidateQueries({ queryKey: ["snippets"], exact: false })
      );

      await Promise.allSettled(tasks);
    },
  });
};

export const useDeleteSnippet = () => {
  const qc = useQueryClient();

  return useMutation<ApiSnippet, Error, { id: number | string }>({
    mutationFn: ({ id }) => deleteSnippet(id),

    onSuccess: async (_deleted) => {
      await Promise.allSettled([
        qc.invalidateQueries({ queryKey: ["snippets"], exact: false }),
        qc.invalidateQueries({ queryKey: ["snippets", "infinite"] }),
        qc.invalidateQueries({ queryKey: ["snippets", "my"] }),
      ]);
    },
  });
};
