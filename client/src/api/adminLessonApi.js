import api from "./api";

export const getAdminLessons = async () => {
  return api.get("/api/lessons/admin/all");
};

export const getAdminLessonById = async (id) => {
  return api.get(`/api/lessons/admin/${id}`);
};

export const createAdminLesson = async (payload) => {
  return api.post("/api/lessons/admin", payload);
};

export const updateAdminLesson = async (id, payload) => {
  return api.put(`/api/lessons/admin/${id}`, payload);
};

export const deleteAdminLesson = async (id) => {
  return api.delete(`/api/lessons/admin/${id}`);
};