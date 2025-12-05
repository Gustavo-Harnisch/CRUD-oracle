import api from "./api";

// Ajusta la ruta según tu backend, p. ej. /auth/login o /login
export const login = (credentials) => api.post("/auth/login", credentials);
export const register = (payload) => api.post("/auth/register", payload);

export const getProfile = () => api.get("/auth/me");
