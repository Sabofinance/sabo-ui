import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAdminAuth } from './AdminAuthContext';
import AppLoader from '../components/AppLoader';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children, allowedRoles = ['admin', 'super_admin'] }) => {
  const { isLoading: isUserLoading } = useAuth();
  const { adminUser, isAdminAuthenticated, isAdminLoading } = useAdminAuth();

  if (isAdminLoading || isUserLoading) return <AppLoader />;

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = String(adminUser?.role || '').toLowerCase();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;

