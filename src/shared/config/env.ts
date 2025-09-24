export const ENV = {
  API_URL: import.meta.env.VITE_API_URL as string,
  WS_URL: import.meta.env.VITE_WS_URL as string,
} as const;
