import axios from "axios";

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "https://pera-music-school.onrender.com";
  }

  return "";
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

export default api;
