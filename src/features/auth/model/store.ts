import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: number;
  username: string;
  role: "user" | "admin";
};

type AuthState = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (setState) => ({
      user: null,
      login: (user) => setState({ user }),
      logout: () => setState({ user: null }),
    }),
    { name: "auth" }
  )
);
