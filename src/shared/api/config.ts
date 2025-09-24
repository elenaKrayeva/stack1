export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const WS_ENABLED =
  (import.meta.env.VITE_WS_ENABLED ?? "false") === "true";

export const WS_NAMESPACE = import.meta.env.VITE_WS_NAMESPACE ?? "/ws";
