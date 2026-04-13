import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import AdminSidebar from './AdminSidebar';
import DashboardHeader from './DashboardHeader';
import { SidebarProvider } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import '../assets/css/DashboardLayout.css';

const KYC_UNRESTRICTED_PATHS = [
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/kyc',
  '/dashboard/notifications',
];

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/dashboard/admin');

  const kycStatus = String((user as any)?.kyc_status || '').toLowerCase();
  const isVerified = kycStatus === 'verified';
  const isPending = kycStatus === 'pending';
  const showKycBanner = !isAdminRoute && !isVerified;

  const isDashboardHome = location.pathname === '/dashboard';
  const isUnrestricted =
    isDashboardHome || KYC_UNRESTRICTED_PATHS.some((p) => location.pathname.startsWith(p));
  const shouldBlur = !isAdminRoute && !isVerified && !isUnrestricted;

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
            {shouldBlur ? (
              <div className="kyc-blur-wrapper">
                <div className="kyc-blur-content">
                  <Outlet />
                </div>
                <div className="kyc-blur-overlay">
                  <div className="kyc-blur-card">
                    <div className="kyc-blur-icon-wrap">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A1E28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <h3 className="kyc-blur-title">KYC Verification Required</h3>
                    <p className="kyc-blur-desc">
                      You need to complete your identity verification before you can access this feature.
                    </p>
                    <button
                      className="kyc-blur-btn"
                      onClick={() => navigate('/dashboard/kyc')}
                    >
                      Complete KYC
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;