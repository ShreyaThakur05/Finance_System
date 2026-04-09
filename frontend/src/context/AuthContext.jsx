import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import api from "../api/client";

const Ctx = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const navRef = useRef(null);
  const qcRef = useRef(null);

  const user = token ? parseJwt(token) : null;

  const register = useCallback((nav, qc) => {
    navRef.current = nav;
    qcRef.current = qc;
  }, []);

  const _doLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    if (qcRef.current) qcRef.current.clear();
    if (navRef.current) navRef.current("/login", { replace: true });
  }, []);

  // Listen for forced logout from axios interceptor (expired refresh token)
  useEffect(() => {
    window.addEventListener("auth:logout", _doLogout);
    return () => window.removeEventListener("auth:logout", _doLogout);
  }, [_doLogout]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/api/v1/auth/logout").catch(() => {});
    _doLogout();
  }, [_doLogout]);

  const hasRole = useCallback(
    (...roles) => roles.includes(user?.role),
    [user]
  );

  return (
    <Ctx.Provider value={{ token, user, login, logout, hasRole, register }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
