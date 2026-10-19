import { apiRequest } from "./client";

export const getRecipes = (token, { search = "", category = "" } = {}) => {
  const params = [];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  const query = params.length ? `?${params.join("&")}` : "";
  return apiRequest(`/api/recipes${query}`, { token });
};

export const getRecipe = (id, token) => apiRequest(`/api/recipes/${id}`, { token });

export const createRecipe = (recipe, token) => apiRequest("/api/recipes", { method: "POST", body: recipe, token });

export const updateRecipe = (id, recipe, token) => apiRequest(`/api/recipes/${id}`, { method: "PATCH", body: recipe, token });

export const deleteRecipe = (id, token) => apiRequest(`/api/recipes/${id}`, { method: "DELETE", token });