import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi } from "../api/client.js";

const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const persist = useCallback((next) => {
    if (next) localStorage.setItem("auth", JSON.stringify(next));
    else localStorage.removeItem("auth");
    setAuth(next);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    persist(data);
    return data;
  }, [persist]);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    persist(data);
    return data;
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({
    auth,
    isLoggedIn: Boolean(auth),
    isAdmin: auth?.role === "ADMIN",
    login,
    register,
    logout,
  }), [auth, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
