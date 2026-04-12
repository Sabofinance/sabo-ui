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
  const { isAdminLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading || isAdminLoading) return <AppLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const kycStatus = String(user?.kyc_status || "").toLowerCase();
  const isVerified = kycStatus === "verified";
  const isKycRoute = location.pathname === "/dashboard/kyc";

  if (!isVerified && !isKycRoute) {
    return <Navigate to="/dashboard/kyc" replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;

