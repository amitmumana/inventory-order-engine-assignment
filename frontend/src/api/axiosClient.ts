import axios from "axios";
import { BASE_URL } from "../env";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage =
        error.response.data.error || "An unexpected error occurred.";
      toast.error(errorMessage);
    } else {
      toast.error("Network error or server unavailable.");
    }
    return Promise.reject(error);
  }
);

export default api;
