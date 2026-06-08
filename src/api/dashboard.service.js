import axiosInstance from "./axiosInstance";

export const dashboardService = {
  getSummary: () =>
    axiosInstance.get("/dashboard/").then((r) => r.data),
};