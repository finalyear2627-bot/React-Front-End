import axiosInstance from "./axiosInstance";

// LMS endpoints are deliberately kept behind the authenticated API.  In
// particular, the Gemini key must stay on the server and must never be sent to
// the browser.
const ASSIGNMENTS_BASE = "/academics/lms-assignments";
const ENROLLMENTS_BASE = "/academics/obe-students";
const STUDY_MATE_BASE = "/academics/study-companion";

const normaliseTask = (task) => ({
  ...task,
  course_id: task.course_id || task.course,
  deadline: task.deadline || task.due_date,
  total_marks: task.total_marks || task.max_marks,
});

const normaliseTasks = (data) => {
  const tasks = Array.isArray(data) ? data : data?.results || data?.result || [];
  return tasks.map(normaliseTask);
};

const downloadFile = (url, fallbackName) => axiosInstance.get(url, { responseType: "blob" }).then((response) => {
  const header = response.headers["content-disposition"] || "";
  const filename = header.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]?.replace(/['"]/g, "") || fallbackName;
  const objectUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = objectUrl; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  window.URL.revokeObjectURL(objectUrl);
});

export const lmsService = {
  getEnrollments: (params = {}) => axiosInstance.get(`${ENROLLMENTS_BASE}/`, { params }).then((r) => r.data),
  createEnrollment: (data) => axiosInstance.post(`${ENROLLMENTS_BASE}/`, data).then((r) => r.data),
  deleteEnrollment: (id) => axiosInstance.delete(`${ENROLLMENTS_BASE}/${id}/`).then((r) => r.data),

  getTeacherCourses: () => axiosInstance.get("/academics/course-assignments/my-courses/").then((r) => r.data),
  getTasks: (params = {}) => axiosInstance.get(`${ASSIGNMENTS_BASE}/`, { params }).then((r) => ({ ...r.data, result: normaliseTasks(r.data) })),
  createTask: ({ deadline, total_marks, task_type, attachment, ...data }) => {
    const payload = { ...data, due_date: deadline, max_marks: total_marks, task_type };
    if (!attachment) return axiosInstance.post(`${ASSIGNMENTS_BASE}/`, payload).then((r) => r.data);
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
    formData.append("attachment", attachment);
    return axiosInstance.post(`${ASSIGNMENTS_BASE}/`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  },
  getTaskSubmissions: (taskId) => axiosInstance.get(`${ASSIGNMENTS_BASE}/${taskId}/submissions/`).then((r) => r.data),
  downloadTaskAttachment: (taskId, name) => downloadFile(`${ASSIGNMENTS_BASE}/${taskId}/download-attachment/`, name || "assessment-file"),
  downloadSubmission: (taskId, submissionId, name) => downloadFile(`${ASSIGNMENTS_BASE}/${taskId}/download-submission/?submission=${submissionId}`, name || "student-submission"),

  getStudentTasks: () => axiosInstance.get(`${ASSIGNMENTS_BASE}/`).then((r) => ({ ...r.data, result: normaliseTasks(r.data) })),
  getStudentCourses: () => axiosInstance.get(`${ASSIGNMENTS_BASE}/my-courses/`).then((r) => r.data),
  submitTask: (taskId, answer, attachment) => {
    if (!attachment) return axiosInstance.post(`${ASSIGNMENTS_BASE}/${taskId}/submit/`, { response: answer }).then((r) => r.data);
    const formData = new FormData();
    formData.append("response", answer || "");
    formData.append("attachment", attachment);
    return axiosInstance.post(`${ASSIGNMENTS_BASE}/${taskId}/submit/`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  },

  askStudyBot: (message, course) =>
    axiosInstance.post(`${STUDY_MATE_BASE}/chat/`, {
      message,
      ...(course ? { course } : {}),
    }).then((r) => {
      // The shared API helper returns serialized objects in result[].
      // Keep this tolerant of both that convention and direct API replies.
      const payload = r.data || {};
      const reply = Array.isArray(payload.result) ? payload.result[0] : payload.result;
      return {
        ...payload,
        answer: payload.answer || payload.content || reply?.content || reply?.answer || reply?.message || "",
      };
    }),
};
