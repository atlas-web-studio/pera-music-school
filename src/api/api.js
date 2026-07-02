import axios from "axios";

const resolveApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

    if (isLocalhost) {
      return import.meta.env.VITE_API_URL || "https://pera-music-school.onrender.com";
    }

    return "";
  }

  return import.meta.env.VITE_API_URL || "";
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

export default api;
