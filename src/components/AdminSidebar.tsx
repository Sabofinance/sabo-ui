import React from "react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import "../assets/css/DashboardSidebar.css";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 18, height: 18, flexShrink: 0 }}
  >
    {children}
  </svg>
);

const Icons = {
  Dashboard: () => (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  ),
  Users: () => (
    <Icon>
      <circle cx="9" cy="7" r="3.5" />
      <path d="M2 20c0-3.866 3.134-7 7-7s7 3.134 7 7" />
      <path d="M19 8v6M22 11h-6" strokeWidth="2" />
    </Icon>
  ),
  KYC: () => (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M7.5 18c.5-2 2.3-3 4.5-3s4 1 4.5 3" />
      <path d="M9 7h1M14 7h1" strokeWidth="1.5" />
    </Icon>
  ),
  Deposits: () => (
    <Icon>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="7" cy="15" r="1.5" fill="currentColor" stroke="none" />
      <rect x="11" y="13.5" width="6" height="3" rx="1" />
    </Icon>
  ),
  Disputes: () => (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </Icon>
  ),
  Transactions: () => (
    <Icon>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </Icon>
  ),
  Analytics: () => (
    <Icon>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </Icon>
  ),
  Admins: () => (
    <Icon>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </Icon>
  ),
  Logs: () => (
    <Icon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </Icon>
  ),
  Close: () => (
    <Icon>
      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" />
    </Icon>
  ),
};

const AdminSidebar: React.FC = () => {
  const { close, isOpen } = useSidebar();
  const { adminUser, isAdminAuthenticated } = useAdminAuth();
  const role = String(adminUser?.role || "").toLowerCase();
  const isSuperAdmin = isAdminAuthenticated && role === "super_admin";

  const navLink = (
    to: string,
    label: string,
    IconComponent: React.FC,
    end = false,
  ) => (
    <li className="nav-item">
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        onClick={close}
      >
        <IconComponent />
        <span className="link-text">{label}</span>
      </NavLink>
    </li>
  );

  return (
    <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
      <button
        className="sidebar-close-btn"
        onClick={close}
        aria-label="Close menu"
      >
        <Icons.Close />
      </button>

      <div className="sidebar-header">
        <div className="brand-container">
          <div className="sabo-logo-icon">
            <span className="dot-outer" />
            <span className="dot-inner" />
          </div>
          <h1 className="brand-name">sabo admin</h1>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        <ul className="nav-list">
          {navLink("/dashboard/admin", "Dashboard", Icons.Dashboard, true)}
          {navLink("/dashboard/admin/users", "Users", Icons.Users)}
          {navLink("/dashboard/admin/kyc", "KYC", Icons.KYC)}
          {navLink("/dashboard/admin/deposits", "Deposits", Icons.Deposits)}
          {navLink("/dashboard/admin/disputes", "Disputes", Icons.Disputes)}
          {navLink("/dashboard/admin/transactions", "Transactions", Icons.Transactions)}
          {navLink("/dashboard/admin/analytics", "Analytics", Icons.Analytics)}
          {isSuperAdmin &&
            navLink("/dashboard/admin/admins", "Admins", Icons.Admins)}
          {isSuperAdmin && navLink("/dashboard/admin/logs", "Logs", Icons.Logs)}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
