import React, { createContext, useState, useEffect } from "react";
import api, { setAccessToken } from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post("/auth/refresh-token");
        setAccessToken(res.data.accessToken);

        const userRes = await api.get("/auth/me");
        setUser(userRes.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken("");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
