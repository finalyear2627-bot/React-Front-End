import axiosInstance from "./axiosInstance";

export const userService = {
  getAllUsers: async () => {
    const response = await axiosInstance.get("/accounts/users/");
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/accounts/users/${id}/`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await axiosInstance.post("/accounts/users/", data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/accounts/users/${id}/`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/accounts/users/${id}/`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await axiosInstance.post(`/accounts/users/${id}/activate/`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await axiosInstance.post(`/accounts/users/${id}/deactivate/`);
    return response.data;
  },

  changeRole: async (id, role) => {
    const response = await axiosInstance.post(`/accounts/users/${id}/change-role/`, { role });
    return response.data;
  },
};