import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/" replace />;
  }

  // Otherwise, show the requested page
  return children;
};

export default ProtectedRoute;
