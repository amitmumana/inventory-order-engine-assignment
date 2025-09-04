import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAppStore from "../store/store";

interface PrivateRouteProps {
  roles?: ("USER" | "ADMIN")[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles }) => {
  const { isAuthenticated, user } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
