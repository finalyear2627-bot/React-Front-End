import axiosInstance from "./axiosInstance";

const BASE = "/assessments/course-documents";

export const courseDocumentService = {
  getAll: (params = {}) =>
    axiosInstance.get(`${BASE}/`, { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`${BASE}/${id}/`).then((r) => r.data),

  upload: (courseId, title, docType, file) => {
    const formData = new FormData();
    formData.append("course_id", courseId);
    formData.append("title", title);
    formData.append("doc_type", docType);
    formData.append("file", file);
    return axiosInstance
      .post(`${BASE}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  delete: (id) =>
    axiosInstance.delete(`${BASE}/${id}/`).then((r) => r.data),
};
