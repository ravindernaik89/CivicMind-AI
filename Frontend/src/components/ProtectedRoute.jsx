// src/components/ProtectedRoute.jsx

import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {

  const { role: userRole, token } = useContext(AuthContext);

  // Check if token exists first
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Check if user has the required role
  if (userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
