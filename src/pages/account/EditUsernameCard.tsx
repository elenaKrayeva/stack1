import { useState } from "react";
import { Card, CardContent, CardHeader, TextField, Button, Stack, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMyUsernameMutation } from "@/features/account/mutations";
import { useAuthStore } from "@/features/auth/model/store";
import { usernameSchema } from "@/features/auth/validation";

const updateUsernameSchema = z.object({ username: usernameSchema });
type UpdateUsernameFormValues = z.infer<typeof updateUsernameSchema>;

export const EditUsernameCard = ({ initialUsername }: { initialUsername: string }) => {
  const currentUserFromStore = useAuthStore((state) => state.user);
  const setUserInAuthStore = useAuthStore((state) => state.login);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register: registerUpdateUsername,
    handleSubmit: handleSubmitUpdateUsername,
    formState: { errors: updateUsernameFormErrors, isSubmitting: isSubmittingUpdateUsernameForm },
    reset: resetUpdateUsernameForm,
  } = useForm<UpdateUsernameFormValues>({
    resolver: zodResolver(updateUsernameSchema),
    defaultValues: { username: initialUsername },
    mode: "onBlur",
  });

  const { mutateAsync: mutateUpdateMyUsername, isPending: isMutationPendingUpdateUsername } =
    useUpdateMyUsernameMutation((me) => {
      if (currentUserFromStore) setUserInAuthStore({ ...currentUserFromStore, username: me.username });
      setSuccessMessage("Username successfully changed");
      setErrorMessage(null);
      resetUpdateUsernameForm({ username: me.username });
    });

  const onSubmitUpdateUsername = async (values: UpdateUsernameFormValues) => {
    try {
      await mutateUpdateMyUsername({ username: values.username });
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Failed to update name");
      setSuccessMessage(null);
    }
  };

  return (
    <Card className="shadow-sm rounded-2xl">
      <CardHeader title="Edit username" />
      <CardContent>
        <Stack component="form" onSubmit={handleSubmitUpdateUsername(onSubmitUpdateUsername)} className="gap-3">
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="Username"
            {...registerUpdateUsername("username")}
            error={Boolean(updateUsernameFormErrors.username)}
            helperText={updateUsernameFormErrors.username?.message}
            autoComplete="username"
            fullWidth
          />

          <Stack direction="row" className="justify-end">
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmittingUpdateUsernameForm || isMutationPendingUpdateUsername}
            >
              Save username
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
