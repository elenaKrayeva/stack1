import { Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "@/features/auth/api";
import { extractRegisterError } from "../errors";
import { registerSchema, type RegisterFormValues } from "../validation";
import { PasswordField } from "../components/PasswordField";

export const RegisterForm = () => {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerApi({ username: values.username, password: values.password });
      navigate("/login", { replace: true });
    } catch (err) {
      const { field, message } = extractRegisterError(err);
      setError(field ?? "username", { type: "manual", message });
    }
  };

  return (
    <div className="flex justify-center p-6">
      <Paper className="p-6 max-w-md w-full">
        <Typography variant="h5" gutterBottom>
          Create account
        </Typography>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextField
            label="Username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            autoComplete="username"
            disabled={isSubmitting}
          />

          <PasswordField
            name="password"
            label="Password"
            control={control}
            error={errors.password?.message}
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm password"
            control={control}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !isDirty || !isValid}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="mt-3 text-sm">
          Already have an account? <Link to="/login">LOGIN</Link>
        </div>
      </Paper>
    </div>
  );
};
