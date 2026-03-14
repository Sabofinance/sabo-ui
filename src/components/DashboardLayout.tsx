import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import '../assets/css/DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardHeader />
        <div className="dashboard-content">
          <Outlet /> {/* This renders the nested routes */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;