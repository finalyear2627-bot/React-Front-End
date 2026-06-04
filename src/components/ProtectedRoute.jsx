import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { tokenService } from "../services/token.service";

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const token = tokenService.getAccessToken();
    setIsAuthenticated(!!token);

    if (token && allowedRoles) {
      const userRole = localStorage.getItem("user_role");
      setIsAuthorized(allowedRoles.includes(userRole));
    }
  }, [allowedRoles]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;

