import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateMyUsername,
  updateMyPassword,
  type MeResponse,
  deleteMyAccount,
} from "./api";

export const useDeleteMyAccountMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ signal }: { signal?: AbortSignal } = {}) =>
      deleteMyAccount(signal),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      await queryClient.clear();
      onSuccess?.();
    },
  });
};

export const useUpdateMyUsernameMutation = (
  onSuccess?: (me: MeResponse) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      signal,
    }: {
      username: string;
      signal?: AbortSignal;
    }) => updateMyUsername({ username }, signal),
    onSuccess: async (me) => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      onSuccess?.(me);
    },
  });
};

export const useUpdateMyPasswordMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
      signal,
    }: {
      oldPassword: string;
      newPassword: string;
      signal?: AbortSignal;
    }) => updateMyPassword({ oldPassword, newPassword }, signal),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      onSuccess?.();
    },
  });
};
