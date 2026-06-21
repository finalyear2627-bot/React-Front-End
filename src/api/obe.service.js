import axiosInstance from "./axiosInstance";

export const obePlanService = {
  getAll: (params = {}) =>
    axiosInstance.get("/academics/obe-plans/", { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/academics/obe-plans/${id}/`).then((r) => r.data),

  create: (data) =>
    axiosInstance.post("/academics/obe-plans/", data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`/academics/obe-plans/${id}/`).then((r) => r.data),

  getSheet: (id) =>
    axiosInstance.get(`/academics/obe-plans/${id}/sheet/`).then((r) => r.data),

  downloadExcel: (id) =>
    axiosInstance.get(`/academics/obe-plans/${id}/excel/`, { responseType: "blob" }),
};

export const obeComponentService = {
  getAll: (params = {}) =>
    axiosInstance.get("/academics/obe-components/", { params }).then((r) => r.data),

  create: (data) =>
    axiosInstance.post("/academics/obe-components/", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/academics/obe-components/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`/academics/obe-components/${id}/`).then((r) => r.data),
};

export const obeMappingService = {
  getAll: (params = {}) =>
    axiosInstance.get("/academics/obe-mappings/", { params }).then((r) => r.data),

  create: (data) =>
    axiosInstance.post("/academics/obe-mappings/", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/academics/obe-mappings/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`/academics/obe-mappings/${id}/`).then((r) => r.data),
};

export const obeStudentService = {
  getAll: (params = {}) =>
    axiosInstance.get("/academics/obe-students/", { params }).then((r) => r.data),

  create: (data) =>
    axiosInstance.post("/academics/obe-students/", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/academics/obe-students/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`/academics/obe-students/${id}/`).then((r) => r.data),

  bulkCreate: (data) =>
    axiosInstance.post("/academics/obe-students/bulk/", data).then((r) => r.data),
};

export const obeMarkService = {
  getAll: (params = {}) =>
    axiosInstance.get("/academics/obe-marks/", { params }).then((r) => r.data),

  create: (data) =>
    axiosInstance.post("/academics/obe-marks/", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/academics/obe-marks/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`/academics/obe-marks/${id}/`).then((r) => r.data),

  bulkSave: (marks) =>
    axiosInstance.post("/academics/obe-marks/bulk/", { marks }).then((r) => r.data),
};
