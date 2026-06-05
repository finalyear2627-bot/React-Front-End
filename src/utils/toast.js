import { toast } from "react-toastify";

const options = { position: "top-right", autoClose: 4000 };

export const showSuccess = (message) => toast.success(message || "Success", options);
export const showError = (message) => toast.error(message || "Something went wrong", options);
export const showInfo = (message) => toast.info(message || "", options);

/** Extract the best error message from an axios error using the API's status format */
export const getApiError = (err) =>
  err?.response?.data?.status?.message ||
  err?.response?.data?.detail ||
  err?.response?.data?.non_field_errors?.[0] ||
  err?.message ||
  "Something went wrong";
