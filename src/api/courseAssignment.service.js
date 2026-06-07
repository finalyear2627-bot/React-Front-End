import axiosInstance from "./axiosInstance";

const BASE = "/academics/course-assignments";

export const courseAssignmentService = {
  getAll: (params = {}) =>
    axiosInstance.get(`${BASE}/`, { params }).then((r) => r.data),

  create: (data) =>
    axiosInstance.post(`${BASE}/`, data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`${BASE}/${id}/`).then((r) => r.data),

  activate: (id) =>
    axiosInstance.post(`${BASE}/${id}/activate/`).then((r) => r.data),

  deactivate: (id) =>
    axiosInstance.post(`${BASE}/${id}/deactivate/`).then((r) => r.data),

  // Teacher: own assignments
  getMyCourses: (params = {}) =>
    axiosInstance.get(`${BASE}/my-courses/`, { params }).then((r) => r.data),
};
