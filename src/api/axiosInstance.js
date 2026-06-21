import axios from "axios";
import { tokenService } from "../services/token.service";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isLoginEndpoint = url.includes("/auth/login/");
    if (error.response?.status === 401 && !isLoginEndpoint) {
      tokenService.clearTokens();
      sessionStorage.setItem("session_expired", "1");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
