import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppLoader from "../components/AppLoader";
import { useAuth } from "./AuthContext";
import { useAdminAuth } from "./AdminAuthContext";

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

const UserProtectedRoute: React.FC<UserProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading || isAdminLoading) return <AppLoader />;

  if (isAdminAuthenticated) {
    // Admin must never land on user routes.
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = String(user?.role || "").toLowerCase();
  if (role === "admin" || role === "super_admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;

