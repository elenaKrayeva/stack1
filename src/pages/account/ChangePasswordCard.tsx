import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMyPasswordMutation } from "@/features/account/mutations";
import { passwordRules, passwordPresence } from "@/features/auth/validation";

const changePasswordSchema = z
  .object({
    oldPassword: passwordPresence,
    newPassword: passwordRules,
    newPasswordConfirm: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .superRefine(({ newPassword, newPasswordConfirm }, ctx) => {
    if (newPassword !== newPasswordConfirm) {
      ctx.addIssue({
        code: "custom",
        path: ["newPasswordConfirm"],
        message: "Passwords do not match",
      });
    }
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
type PasswordFieldName = keyof ChangePasswordFormValues;

export const ChangePasswordCard = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [passwordVisibilityState, setPasswordVisibilityState] = useState<
    Record<PasswordFieldName, boolean>
  >({
    oldPassword: false,
    newPassword: false,
    newPasswordConfirm: false,
  });

  const togglePasswordVisibility = (fieldName: PasswordFieldName) =>
    setPasswordVisibilityState((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));

  const {
    register: registerChangePassword,
    handleSubmit: handleSubmitChangePassword,
    formState: {
      errors: changePasswordFormErrors,
      isSubmitting: isSubmittingChangePasswordForm,
    },
    reset: resetChangePasswordForm,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", newPasswordConfirm: "" },
    mode: "onBlur",
  });

  const {
    mutateAsync: mutateUpdateMyPassword,
    isPending: isMutationPendingUpdatePassword,
  } = useUpdateMyPasswordMutation(() => {
    setSuccessMessage("Password successfully changed");
    setErrorMessage(null);
    resetChangePasswordForm();
    setPasswordVisibilityState({
      oldPassword: false,
      newPassword: false,
      newPasswordConfirm: false,
    });
  });

  const onSubmitChangePassword = async (values: ChangePasswordFormValues) => {
    try {
      await mutateUpdateMyPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Failed to change password");
      setSuccessMessage(null);
    }
  };

  const renderPasswordTextField = (params: {
    fieldName: PasswordFieldName;
    label: string;
    autoComplete: string;
    errorText?: string;
  }) => {
    const { fieldName, label, autoComplete, errorText } = params;
    const isFieldVisible = passwordVisibilityState[fieldName];

    return (
      <TextField
        type={isFieldVisible ? "text" : "password"}
        label={label}
        {...registerChangePassword(fieldName)}
        error={Boolean(errorText)}
        helperText={errorText}
        autoComplete={autoComplete}
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility(fieldName)}
                  onMouseDown={(event) => event.preventDefault()}
                  edge="end"
                  aria-label={`toggle ${fieldName} visibility`}
                >
                  {isFieldVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  };

  return (
    <Card className="shadow-sm rounded-2xl">
      <CardHeader title="Change password" />
      <CardContent>
        <Stack
          component="form"
          onSubmit={handleSubmitChangePassword(onSubmitChangePassword)}
          className="gap-3"
        >
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {renderPasswordTextField({
            fieldName: "oldPassword",
            label: "Current password",
            autoComplete: "current-password",
            errorText: changePasswordFormErrors.oldPassword?.message,
          })}

          {renderPasswordTextField({
            fieldName: "newPassword",
            label: "New password",
            autoComplete: "new-password",
            errorText: changePasswordFormErrors.newPassword?.message,
          })}

          {renderPasswordTextField({
            fieldName: "newPasswordConfirm",
            label: "Confirm new password",
            autoComplete: "new-password",
            errorText: changePasswordFormErrors.newPasswordConfirm?.message,
          })}

          <Stack direction="row" className="justify-end">
            <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmittingChangePasswordForm ||
                isMutationPendingUpdatePassword
              }
            >
              Update password
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
