import axios from "axios";

const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:3000/api";
const STORAGE_KEY = "booking_ucm_auth";

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch (error) {
    return null;
  }
};

// Axios instance for the app; attach headers or interceptors here if needed
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "";
    if (status === 401 && typeof window !== "undefined") {
      // Token inválido o expirado: limpiar sesión y redirigir a login.
      localStorage.removeItem(STORAGE_KEY);
      // Opcional: redirigir automáticamente
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
