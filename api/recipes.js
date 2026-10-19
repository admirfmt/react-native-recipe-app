import { apiRequest } from "./client";

export const getRecipes = (token) => apiRequest("/api/recipes", { token });

export const getRecipe = (id, token) => apiRequest(`/api/recipes/${id}`, { token });

export const createRecipe = (recipe, token) => apiRequest("/api/recipes", { method: "POST", body: recipe, token });

export const updateRecipe = (id, recipe, token) => apiRequest(`/api/recipes/${id}`, { method: "PATCH", body: recipe, token });

export const deleteRecipe = (id, token) => apiRequest(`/api/recipes/${id}`, { method: "DELETE", token });