import { createContext, useContext, useState, useEffect } from "react";
import { auth as authApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hookbook_token");
    const savedUser = localStorage.getItem("hookbook_user");
    if (token && savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  function persistAuth({ token, user: u }) {
    localStorage.setItem("hookbook_token", token);
    localStorage.setItem("hookbook_user", JSON.stringify(u));
    setUser(u);
  }

  async function signup(email, password) {
    const data = await authApi.signup(email, password);
    persistAuth(data);
    return data;
  }

  async function login(email, password) {
    const data = await authApi.login(email, password);
    persistAuth(data);
    return data;
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem("hookbook_token");
    localStorage.removeItem("hookbook_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
