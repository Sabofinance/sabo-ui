import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../assets/css/DashboardSidebar.css';

const DashboardSidebar: React.FC = () => {
  const { isOpen, close } = useSidebar();
  const { user } = useAuth();
  const { adminUser, isAdminAuthenticated } = useAdminAuth();
  const activeRole = isAdminAuthenticated ? adminUser?.role : user?.role;
  const isAdmin = String(activeRole || '').toLowerCase() === 'admin';

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>

        <button
          className="sidebar-close-btn"
          onClick={close}
          aria-label="Close menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="sidebar-header">
          <div className="brand-container">
            <div className="sabo-logo-icon">
              <span className="dot-outer" />
              <span className="dot-inner" />
            </div>
            <h1 className="brand-name">sabo</h1>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <ul className="nav-list">

            <li className="nav-item">
              <NavLink
                to={isAdmin ? "/dashboard/admin" : "/dashboard"}
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={close}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="link-text">Dashboard</span>
                <span className="indicator-dot" />
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/dashboard/active-sabits"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={close}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="link-text">Market Place</span>
                <span className="indicator-dot" />
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/dashboard/my-sabits"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={close}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="link-text">My Sabits</span>
                <span className="indicator-dot" />
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/dashboard/history"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={close}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="link-text">History</span>
                <span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/wallets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 7h18v12H3V7z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 10h4v7h-4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 14h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Wallets</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/ledger" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M7 3h10l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 3v4h4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 13h8M8 17h8M8 9h5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Ledger</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/deposits" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Deposits</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/withdrawals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 21V9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 14l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 3h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Withdrawals</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/beneficiaries" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 8v6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Beneficiaries</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/conversions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M7 7h10v10H7V7z" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
                  <path d="M7 7h10v10H7V7z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Conversions</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/trades" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Trades</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/disputes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">Disputes</span><span className="indicator-dot" />
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/kyc" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="link-text">KYC</span><span className="indicator-dot" />
              </NavLink>
            </li>

            {isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/dashboard/admin"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={close}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 7h16l-2 14H6L4 7z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 7l5-4 5 4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="link-text">Admin</span><span className="indicator-dot" />
                </NavLink>
              </li>
            )}

            <li className="nav-item">
              <NavLink
                to="/dashboard/chat"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={close}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="link-text">Chat with Sabo</span>
                <span className="indicator-dot" />
              </NavLink>
            </li>

          </ul>
        </nav>

      </aside>
    </>
  );
};

export default DashboardSidebar;