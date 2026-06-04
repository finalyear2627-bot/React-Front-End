import axiosInstance from "./axiosInstance";

export const programService = {
  // Get all programs
  getAllPrograms: async () => {
    const response = await axiosInstance.get("/academics/programs/");
    return response.data;
  },

  // Get single program
  getProgramById: async (id) => {
    const response = await axiosInstance.get(`/academics/programs/${id}/`);
    return response.data;
  },

  // Create program
  createProgram: async (data) => {
    const response = await axiosInstance.post("/academics/programs/", data);
    return response.data;
  },

  // Update program
  updateProgram: async (id, data) => {
    const response = await axiosInstance.put(`/academics/programs/${id}/`, data);
    return response.data;
  },

  // Partial update
  partialUpdateProgram: async (id, data) => {
    const response = await axiosInstance.patch(`/academics/programs/${id}/`, data);
    return response.data;
  },

  // Delete program
  deleteProgram: async (id) => {
    await axiosInstance.delete(`/academics/programs/${id}/`);
  },

  // Bulk create programs (one by one)
  bulkCreatePrograms: async (programs) => {
    const results = [];
    for (const program of programs) {
      try {
        const data = await axiosInstance.post("/academics/programs/", program);
        results.push({ success: true, data: data.data, code: program.code });
      } catch (err) {
        results.push({
          success: false,
          code: program.code,
          error: err.response?.data?.detail || err.response?.data?.code?.[0] || "Failed to create",
        });
      }
    }
    return results;
  },
};

