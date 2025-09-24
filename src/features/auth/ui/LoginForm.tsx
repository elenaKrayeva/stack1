import { Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/model/store";
import { useNavigate, useLocation, Link, type Location } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "@/features/auth/validation";
import { PasswordField } from "@/features/auth/components/PasswordField";

type LocationState = { from?: Location };

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as LocationState | null)?.from?.pathname ?? "/";

  const setUser = useAuthStore((state) => state.login);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { username: "", password: "" },
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const resp = await loginApi(values);          
      const { data } = resp as any;
      setUser({
        id: Number(data.id),
        username: data.username,
        role: data.role,
      });
  
      navigate(fromPath, { replace: true });
    } catch {
      const message = "Invalid credentials";
      setError("username", { type: "manual", message });
      setError("password", { type: "manual", message });
    }
  };
  

  return (
    <div className="flex justify-center p-6">
      <Paper className="p-6 max-w-md w-full">
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        <form noValidate onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-4">
          <TextField
            label="Username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            autoComplete="username"
            autoFocus
            disabled={isSubmitting}
            inputProps={{ "aria-invalid": !!errors.username || undefined }}
          />

          <PasswordField
            name="password"
            label="Password"
            control={control}
            error={errors.password?.message}
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !isDirty || !isValid}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-3 text-sm">
          Don't have an account? <Link to="/register">REGISTER</Link>
        </div>
      </Paper>
    </div>
  );
};
