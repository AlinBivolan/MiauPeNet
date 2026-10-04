import api from "./api";

export const getAdminCategories = async () => {
  return api.get("/api/categories/admin");
};

export const getAdminCategoryById = async (id) => {
  return api.get(`/api/categories/admin/${id}`);
};

export const createAdminCategory = async (payload) => {
  return api.post("/api/categories/admin", payload);
};

export const updateAdminCategory = async (id, payload) => {
  return api.put(`/api/categories/admin/${id}`, payload);
};

export const deleteAdminCategory = async (id) => {
  return api.delete(`/api/categories/admin/${id}`);
};