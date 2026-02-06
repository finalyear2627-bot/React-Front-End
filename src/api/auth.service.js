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

    return response.data;
  },

  logout: () => {
    tokenService.clearTokens();
  },
};
