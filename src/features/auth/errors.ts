import axios from "axios";
import type { RegisterFormValues } from "./validation";

export const extractRegisterError = (err: unknown): {
  field?: keyof RegisterFormValues;
  message: string;
} => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = (err.response?.data ?? {}) as { message?: string; error?: string };
    const msg = data.message || data.error || "";

    if (status === 409) return { field: "username", message: "Username is already taken" };
    if (status === 400 || status === 422) return { field: "username", message: msg || "Invalid data" };
    return { field: "username", message: msg || "Registration failed. Please try again later" };
  }
  return { field: "username", message: "Unexpected error" };
}
