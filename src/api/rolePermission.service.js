import axiosInstance from "./axiosInstance";

const BASE = "/accounts/role-permissions";

export const rolePermissionService = {
  // All entries, optional ?role=&module= filters
  getAll: (params = {}) =>
    axiosInstance.get(`${BASE}/`, { params }).then((r) => r.data),

  // All 8 modules for one role (missing ones return all-false)
  getByRole: (role) =>
    axiosInstance.get(`${BASE}/by-role/`, { params: { role } }).then((r) => r.data),

  // Save all modules for a role at once
  // payload: { role, permissions: [{ module, can_view, can_create, can_edit, can_delete }] }
  setBulk: (data) =>
    axiosInstance.post(`${BASE}/set-bulk/`, data).then((r) => r.data),

  activate: (id) =>
    axiosInstance.post(`${BASE}/${id}/activate/`).then((r) => r.data),

  deactivate: (id) =>
    axiosInstance.post(`${BASE}/${id}/deactivate/`).then((r) => r.data),

  // Single-entry CRUD (kept for legacy / fine-grained use)
  create: (data) =>
    axiosInstance.post(`${BASE}/`, data).then((r) => r.data),

  patch: (id, data) =>
    axiosInstance.patch(`${BASE}/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`${BASE}/${id}/`).then((r) => r.data),
};
