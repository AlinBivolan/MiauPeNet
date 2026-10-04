import api from "./api";

export const getGames = async () => {
  return api.get("/api/games");
};

export const getGameById = async (gameId) => {
  return api.get(`/api/games/${gameId}`);
};

export const checkGameAnswer = async (gameId, payload) => {
  return api.post(`/api/games/${gameId}/check`, payload);
};