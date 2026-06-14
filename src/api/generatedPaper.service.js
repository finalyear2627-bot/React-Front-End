import axiosInstance from "./axiosInstance";

const BASE = "/assessments/generated-papers";

export const generatedPaperService = {
  getAll: (params = {}) =>
    axiosInstance.get(`${BASE}/`, { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`${BASE}/${id}/`).then((r) => r.data),

  generate: (data) =>
    axiosInstance.post(`${BASE}/generate/`, data).then((r) => r.data),

  download: async (id, filename = "assessment_paper.pdf") => {
    const response = await axiosInstance.get(`${BASE}/${id}/download/`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
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