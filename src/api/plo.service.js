import axiosInstance from "./axiosInstance";

const BASE = "/academics/plos";

export const ploService = {
  getAll: (params = {}) =>
    axiosInstance.get(`${BASE}/`, { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`${BASE}/${id}/`).then((r) => r.data),

  create: (data) =>
    axiosInstance.post(`${BASE}/`, data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`${BASE}/${id}/`, data).then((r) => r.data),

  patch: (id, data) =>
    axiosInstance.patch(`${BASE}/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`${BASE}/${id}/`).then((r) => r.data),

  bulkImport: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance
      .post(`${BASE}/bulk-import/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};