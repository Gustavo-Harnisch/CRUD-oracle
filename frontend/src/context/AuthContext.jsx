import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, register as registerRequest } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "booking_ucm_auth";

const loadStoredAuth = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
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

  useEffect(() => {
    const stored = loadStoredAuth();
    if (stored?.token || stored?.user) {
      setToken(stored.token || null);
      setUser(stored.user || null);
    }
    setIsLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const { data } = await loginRequest({ email, password });
    const authPayload = {
      token: data?.token || null,
      user: data?.user || null,
    };
    setToken(authPayload.token);
    setUser(authPayload.user);
    saveStoredAuth(authPayload);
    return authPayload;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    const authPayload = {
      token: data?.token || null,
      user: data?.user || null,
    };
    setToken(authPayload.token);
    setUser(authPayload.user);
    saveStoredAuth(authPayload);
    return authPayload;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token || user)
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
