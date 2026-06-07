import axiosInstance from "./axiosInstance";
import { tokenService } from "../services/token.service";

export const authService = {
  login: async (username, password) => {
    const response = await axiosInstance.post("/auth/login/", {
      username,
      password,
    });

    tokenService.setTokens(response.data.access, response.data.refresh);
    // role may live at top-level or inside result
    const role =
      response.data.role ||
      response.data.result?.role ||
      response.data.user?.role ||
      "";
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_id", response.data.user_id || response.data.result?.user_id || "");
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

  logout: async () => {
    const refresh = tokenService.getRefreshToken();
    try {
      await axiosInstance.post("/accounts/logout/", { refresh });
    } catch (_) {
      // clear tokens regardless of API response
    }
    tokenService.clearTokens();
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
  },

  getCurrentUser: () => ({
    role:     localStorage.getItem("user_role"),
    user_id:  localStorage.getItem("user_id"),
    username: localStorage.getItem("username"),
  }),

  getProfile: () =>
    axiosInstance.get("/accounts/profile/").then((r) => r.data),

  updateProfile: (data) =>
    axiosInstance.put("/accounts/profile/", data).then((r) => r.data),

  changePassword: (data) =>
    axiosInstance.post("/accounts/change-password/", data).then((r) => r.data),
};
