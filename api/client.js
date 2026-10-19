import { API_URL } from "../config";

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => (unauthorizedHandler = fn);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    console.error("Network error:", e);
    throw new ApiError("No connection to server.", 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // empty
  }

  if (!response.ok) {
    console.error("API error:", response.status, data);
    if (response.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(data?.message || "Something went wrong.", response.status);
  }
  return data;
}