import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import AdminSidebar from './AdminSidebar';
import DashboardHeader from './DashboardHeader';
import { SidebarProvider } from '../context/SidebarContext';
import '../assets/css/DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/dashboard/admin');

  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        {isAdminRoute ? <AdminSidebar /> : <DashboardSidebar />}
        <div className="dashboard-main">
          <DashboardHeader />
          <div className="dashboard-content">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;