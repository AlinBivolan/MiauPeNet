import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const startLesson = (categoryId, index) => {
  return api.get(`/lessons/play/${categoryId}/${index}`);
};

export const checkAnswer = (lessonId, level, payload) => {
  return api.post(`/lessons/${lessonId}/level/${level}/check-answer`, payload);
};

export const submitQuiz = (lessonId, level, payload) => {
  return api.post(`/lessons/${lessonId}/level/${level}/submit-quiz`, payload);
};

export default api;