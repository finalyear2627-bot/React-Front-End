import axiosInstance from "./axiosInstance";

const BASE = "/academics/semesters";

export const semesterService = {
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

  activate: (id) =>
    axiosInstance.post(`${BASE}/${id}/activate/`).then((r) => r.data),

  deactivate: (id) =>
    axiosInstance.post(`${BASE}/${id}/deactivate/`).then((r) => r.data),

  assignCourses: (id, courseIds, replace = false) =>
    axiosInstance
      .post(`${BASE}/${id}/assign-courses/`, { course_ids: courseIds, replace })
      .then((r) => r.data),

  getCourses: (id, params = {}) =>
    axiosInstance.get(`${BASE}/${id}/courses/`, { params }).then((r) => r.data),
};