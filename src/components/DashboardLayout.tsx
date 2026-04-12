import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import AdminSidebar from './AdminSidebar';
import DashboardHeader from './DashboardHeader';
import { SidebarProvider } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import '../assets/css/DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/dashboard/admin');

  const kycStatus = String((user as any)?.kyc_status || '').toLowerCase();
  const isVerified = kycStatus === 'verified';
  const isPending = kycStatus === 'pending';
  const showKycBanner = !isAdminRoute && !isVerified;

  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        {isAdminRoute ? <AdminSidebar /> : <DashboardSidebar />}
        <div className="dashboard-main">
          {showKycBanner && (
            <div className="dashboard-kyc-banner">
              <div className="dashboard-kyc-copy">
                <span className="dashboard-kyc-icon">⚠️</span>
                <div className="dashboard-kyc-text">
                  <strong>{isPending ? 'KYC pending review' : 'KYC required'}</strong>
                  <span>
                    {isPending
                      ? 'Trading unlocks once verified.'
                      : 'Complete identity verification to trade.'}
                  </span>
                </div>
              </div>
              <button
                className="dashboard-kyc-btn"
                onClick={() => navigate('/dashboard/kyc')}
              >
                {isPending ? 'View Status' : 'Complete KYC'}
              </button>
            </div>
          )}
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