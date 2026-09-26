import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. On initial load/refresh, check localStorage for the token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        try {
          // Optional: Verify token with backend or decode stored user details
          // const response = await fetch('/api/me', { headers: { Authorization: `Bearer ${storedToken}` } });
          // const userData = await response.json();

          // For demonstration, we load user state from stored token/user data:
          const storedUser = JSON.parse(localStorage.getItem("userData"));
          setUser(storedUser);
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // 2. Login function: Save token to localStorage and update state
  const login = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  // 3. Logout function: Clear localStorage and reset state
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
