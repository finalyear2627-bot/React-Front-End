import axiosInstance from "./axiosInstance";
import { tokenService } from "../services/token.service";

export const authService = {
  login: async (username, password) => {
    const response = await axiosInstance.post("/auth/login/", {
      username,
      password,
    });


    tokenService.setTokens(
      response.data.access,
      response.data.refresh
    );

    localStorage.setItem("user_role", response.data.role || "STUDENT");
    localStorage.setItem("user_id", response.data.user_id || "");
    localStorage.setItem("username", username);

    return response.data;
  },

  register: async (userData, role = "STUDENT") => {
    const endpoint = role === "ADMIN"
      ? "/auth/register/admin/"
      : role === "TEACHER"
      ? "/auth/register/teacher/"
      : "/auth/register/student/";

    return await axiosInstance.post(endpoint, userData);
  },

  logout: () => {
    tokenService.clearTokens();
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
  },

  getCurrentUser: () => {
    return {
      role: localStorage.getItem("user_role"),
      user_id: localStorage.getItem("user_id"),
      username: localStorage.getItem("username"),
    };
  },
};
