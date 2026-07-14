import axios from "axios";
import { tokenService } from "../services/token.service";

const localApiUrl = "http://127.0.0.1:8000/api";
// Vercel builds must always call the deployed backend. Local development
// keeps using REACT_APP_API_URL from .env (or the local default).
const productionApiUrl = "https://django-backend-si6i.onrender.com/api";
const apiUrl = process.env.NODE_ENV === "production"
  ? productionApiUrl
  : (process.env.REACT_APP_API_URL || localApiUrl);

const axiosInstance = axios.create({
  baseURL: apiUrl,
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
