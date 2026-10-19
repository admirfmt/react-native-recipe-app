import { apiRequest } from "./client";

export const loginRequest = (username, password) =>
  apiRequest("/api/auth/login", { method: "POST", body: { username, password } });

export const registerRequest = (username, password) =>
  apiRequest("/api/auth/register", { method: "POST", body: { username, password } });