import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/hooks";
import { setUnauthorizedHandler } from "../api/client";
import type { AuthResponse } from "../api/types";

interface AuthValue {
  auth: AuthResponse | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const KEY = "auth";

function readStored(): AuthResponse | null {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(readStored);
  const qc = useQueryClient();

  const persist = useCallback((next: AuthResponse | null) => {
    try { if (next) localStorage.setItem(KEY, JSON.stringify(next)); else localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    setAuth(next);
    if (!next) qc.removeQueries({ queryKey: ["admin"] });
  }, [qc]);

  const logout = useCallback(() => persist(null), [persist]);

  // A 401 on any authenticated call means the token expired or was revoked.
  useEffect(() => { setUnauthorizedHandler(logout); return () => setUnauthorizedHandler(null); }, [logout]);

  // Re-validate a stored token once on load.
  useEffect(() => {
    const stored = readStored();
    if (stored) authApi.me(stored.token).catch(() => undefined); // 401 -> handler logs out
  }, []);

  const login = useCallback(async (email: string, password: string) => { const d = await authApi.login(email, password); persist(d); return d; }, [persist]);
  const register = useCallback(async (name: string, email: string, password: string) => { const d = await authApi.register(name, email, password); persist(d); return d; }, [persist]);

  const value = useMemo<AuthValue>(() => ({ auth, isAdmin: auth?.role === "Admin", login, register, logout }), [auth, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
