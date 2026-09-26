// src/components/Navigation.js
import React from "react";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const { user, login, logout } = useAuth();

  const handleDemoLogin = () => {
    const fakeToken = "abc123token";
    const fakeUserData = { name: "Alex", email: "alex@example.com" };
    login(fakeToken, fakeUserData);
  };

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      {user ? (
        <div>
          <span>Welcome, {user.name}! </span>
          <button onClick={logout}>Sign Out</button>
        </div>
      ) : (
        <div>
          <span>You are logged out. </span>
          <button onClick={handleDemoLogin}>Sign In (Demo)</button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
