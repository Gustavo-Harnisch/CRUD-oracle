import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as loginRequest,
  register as registerRequest,
  getProfile,
} from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "booking_ucm_auth";

const loadStoredAuth = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Si se guardó solo el token, usamos ese token; si falta, no devolvemos nada.
    if (!parsed?.token) return null;
    return parsed;
  } catch (error) {
    return null;
  }
};

const saveStoredAuth = (data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const clearStoredAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const resetAuthState = () => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  };

  useEffect(() => {
    const stored = loadStoredAuth();
    if (stored?.token) {
      setToken(stored.token);
      setUser(stored.user || null);
    }
    setIsLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    resetAuthState();
    const { data } = await loginRequest({ email, password });
    const roles = Array.isArray(data?.user?.roles) ? data.user.roles : (data?.user?.role ? [data.user.role] : []);
    const normalizedUser = data?.user ? { ...data.user, roles } : null;
    const authPayload = {
      token: data?.token,
      user: normalizedUser,
    };
    setToken(authPayload.token || null);
    setUser(authPayload.user || null);
    saveStoredAuth(authPayload);
    return authPayload;
  };

  const logout = () => {
    // Opcional: podrías llamar al backend /api/auth/logout aquí si quieres revocar el token.
    resetAuthState();
  };

  const register = async (payload) => {
    resetAuthState();
    // Aseguramos rol por defecto USER y normalizamos mayúsculas
    const defaultRole = "USER";
    const roleFromPayload =
      payload?.role || (Array.isArray(payload?.roles) ? payload.roles[0] : null) || defaultRole;
    const normalizedRole = String(roleFromPayload).toUpperCase();
    const rutDigits = String(payload?.codUsuario ?? payload?.rut ?? "")
      .replace(/\D/g, "")
      .slice(0, 9); // limitar longitud defensiva

    const { data } = await registerRequest({
      ...payload,
      codUsuario: rutDigits || undefined,
      role: normalizedRole,
    });
    const rolesArr = Array.isArray(data?.user?.roles)
      ? data.user.roles
      : data?.user?.role
        ? [data.user.role]
        : [];
    const normalizedUser = data?.user ? { ...data.user, roles: rolesArr } : null;
    const authPayload = {
      token: data?.token,
      user: normalizedUser,
    };
    setToken(authPayload.token || null);
    setUser(authPayload.user || null);
    saveStoredAuth(authPayload);
    return authPayload;
  };

  const refreshProfile = async () => {
    const { data } = await getProfile();
    const roles = Array.isArray(data?.roles) ? data.roles : (data?.role ? [data.role] : []);
    setUser({ ...data, roles });
    const stored = loadStoredAuth();
    if (stored?.token) {
      saveStoredAuth({ token: stored.token, user: { ...data, roles } });
    }
    return { ...data, roles };
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      isAuthenticated: Boolean(token),
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
