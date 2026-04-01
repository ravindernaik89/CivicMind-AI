// src/context/AuthContext.jsx

import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [role, setRole] = useState(localStorage.getItem("role"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (jwtToken, userRole) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("role", userRole);
    setToken(jwtToken);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};