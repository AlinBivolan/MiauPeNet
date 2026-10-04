import api from "./api";

export const getAdminGames = async () => {
  return api.get("/api/admin/games");
};

export const getAdminGameById = async (id) => {
  return api.get(`/api/admin/games/${id}`);
};

export const createAdminGame = async (payload) => {
  return api.post("/api/admin/games", payload);
};

export const updateAdminGame = async (id, payload) => {
  return api.put(`/api/admin/games/${id}`, payload);
};

export const deleteAdminGame = async (id) => {
  return api.delete(`/api/admin/games/${id}`);
};