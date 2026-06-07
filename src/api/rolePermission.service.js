import axiosInstance from "./axiosInstance";

export const rolePermissionService = {
  getAllRolePermissions: async () => {
    const response = await axiosInstance.get("/accounts/role-permissions/");
    return response.data;
  },

  getRolePermissionById: async (id) => {
    const response = await axiosInstance.get(`/accounts/role-permissions/${id}/`);
    return response.data;
  },

  createRolePermission: async (data) => {
    const response = await axiosInstance.post("/accounts/role-permissions/", data);
    return response.data;
  },

  updateRolePermission: async (id, data) => {
    const response = await axiosInstance.put(`/accounts/role-permissions/${id}/`, data);
    return response.data;
  },

  deleteRolePermission: async (id) => {
    const response = await axiosInstance.delete(`/accounts/role-permissions/${id}/`);
    return response.data;
  },

  activateRolePermission: async (id) => {
    const response = await axiosInstance.post(`/accounts/role-permissions/${id}/activate/`);
    return response.data;
  },

  deactivateRolePermission: async (id) => {
    const response = await axiosInstance.post(`/accounts/role-permissions/${id}/deactivate/`);
    return response.data;
  },
};