import axiosInstance from "./axiosInstance";
import { tokenService } from "../services/token.service";
import { savePermissions, clearPermissions } from "../utils/permissions";

export const authService = {
  login: async (username, password) => {
    // Clear stale tokens so the login request goes out without Authorization header
    tokenService.clearTokens();
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_first_name");
    localStorage.removeItem("user_last_name");

    const response = await axiosInstance.post("/auth/login/", { username, password });

    // Support both { result: [{...}] } and { result: {...} } shapes
    const raw    = response.data.result;
    const result = (Array.isArray(raw) ? raw[0] : raw) ?? {};
    const user   = result.user ?? {};

    // Only store tokens if they actually exist in the response
    if (result.access) {
      tokenService.setTokens(result.access, result.refresh);
    }
    localStorage.setItem("user_role",       user.role       || "");
    localStorage.setItem("user_id",         String(user.id  || ""));
    localStorage.setItem("username",        user.username   || username);
    localStorage.setItem("user_email",      user.email      || "");
    localStorage.setItem("user_first_name", user.first_name || "");
    localStorage.setItem("user_last_name",  user.last_name  || "");

    // Load role permissions (non-blocking — ADMIN has no restrictions so skip)
    if (user.role && user.role !== "ADMIN") {
      try {
        const permRes = await axiosInstance.get("/accounts/role-permissions/by-role/", {
          params: { role: user.role },
          headers: { Authorization: `Bearer ${result.access}` },
        });
        const perms = permRes.data?.result || permRes.data?.results || permRes.data || [];
        savePermissions(Array.isArray(perms) ? perms : []);
      } catch (_) {
        // if it fails just continue — ADMIN will see everything anyway
      }
    } else {
      clearPermissions(); // ADMIN — no restriction map needed
    }

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
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_first_name");
    localStorage.removeItem("user_last_name");
    clearPermissions();
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

  patchProfile: (data) =>
    axiosInstance.patch("/accounts/profile/", data).then((r) => r.data),

  changePassword: (data) =>
    axiosInstance.post("/accounts/change-password/", data).then((r) => r.data),

  getMyPermissions: () =>
    axiosInstance.get("/accounts/my-permissions/").then((r) => r.data),
};
