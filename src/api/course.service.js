import axiosInstance from "./axiosInstance";

export const courseService = {
  getAllCourses: async () => {
    const response = await axiosInstance.get("/academics/courses/");
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await axiosInstance.get(`/academics/courses/${id}/`);
    return response.data;
  },

  createCourse: async (data) => {
    const response = await axiosInstance.post("/academics/courses/", data);
    return response.data;
  },

  updateCourse: async (id, data) => {
    const response = await axiosInstance.put(`/academics/courses/${id}/`, data);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await axiosInstance.delete(`/academics/courses/${id}/`);
    return response.data;
  },

  bulkUploadCourses: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post("/academics/courses/bulk-import/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
