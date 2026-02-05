import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenService } from "../services/token.service";

const PrivateRoute = () => {
  const accessToken = tokenService.getAccessToken();

  // if not logged in → redirect to sign in
  if (!accessToken) {
    return <Navigate to="/sign-in" replace />;
  }

  // if logged in → allow access
  return <Outlet />;
};

export default PrivateRoute;
