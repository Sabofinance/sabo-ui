import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AppLoader from '../components/AppLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = String(user?.role || '').toLowerCase();
  const path = location.pathname;
  const isAdminRoute = path === '/dashboard/admin' || path.startsWith('/dashboard/admin/');
  const isUserDashboardRoute = path.startsWith('/dashboard') && !isAdminRoute;

  // Role-based separation: admins/super_admins must never land on user dashboard routes.
  if ((role === 'admin' || role === 'super_admin') && isUserDashboardRoute) {
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (!['admin', 'super_admin'].includes(role) && isAdminRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;