import axiosInstance from "./axiosInstance";

const BASE = "/assessments/generated-papers";

export const generatedPaperService = {
  getAll: (params = {}) =>
    axiosInstance.get(`${BASE}/`, { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`${BASE}/${id}/`).then((r) => r.data),

  generate: (data) =>
    axiosInstance.post(`${BASE}/generate/`, data).then((r) => r.data),

  download: async (id, filename = "paper.pdf") => {
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
    // Open synchronously from the user's click so browsers do not block the
    // document as an asynchronous popup (especially on the deployed site).
    const tab = window.open("", "_blank");
    try {
      const response = await axiosInstance.get(`${BASE}/${id}/download/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (error) {
      tab?.close();
      throw error;
    }
  },

  delete: (id) =>
    axiosInstance.delete(`${BASE}/${id}/`).then((r) => r.data),
};
