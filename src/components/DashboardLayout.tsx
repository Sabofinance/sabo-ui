import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { SidebarProvider } from '../context/SidebarContext';
import '../assets/css/DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        <DashboardSidebar />
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