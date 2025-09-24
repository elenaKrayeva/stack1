import axios from "axios";
import { ENV } from "@/shared/config/env";

export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
});
