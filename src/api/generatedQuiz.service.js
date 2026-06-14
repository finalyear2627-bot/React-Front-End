import axiosInstance from "./axiosInstance";

const BASE = "/assessments/generated-quizzes";

export const generatedQuizService = {
  getAll: (params = {}) =>
    axiosInstance.get(`${BASE}/`, { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`${BASE}/${id}/`).then((r) => r.data),

  generate: (data) =>
    axiosInstance.post(`${BASE}/generate/`, data).then((r) => r.data),

  download: async (id, filename = "quiz.pdf") => {
    const response = await axiosInstance.get(`${BASE}/${id}/download/`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  openInNewTab: async (id) => {
    const response = await axiosInstance.get(`${BASE}/${id}/download/`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 30000);
  },

  delete: (id) =>
    axiosInstance.delete(`${BASE}/${id}/`).then((r) => r.data),
};