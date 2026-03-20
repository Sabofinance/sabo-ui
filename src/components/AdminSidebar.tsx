import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../assets/css/DashboardSidebar.css';

const AdminSidebar: React.FC = () => {
  const { close, isOpen } = useSidebar();
  const { adminUser, isAdminAuthenticated } = useAdminAuth();
  const role = String(adminUser?.role || '').toLowerCase();
  const isSuperAdmin = isAdminAuthenticated && role === 'super_admin';

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close-btn" onClick={close} aria-label="Close menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="sidebar-header">
        <div className="brand-container">
          <div className="sabo-logo-icon"><span className="dot-outer" /><span className="dot-inner" /></div>
          <h1 className="brand-name">sabo admin</h1>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Admin navigation">
        <ul className="nav-list">
          <li className="nav-item"><NavLink to="/dashboard/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}><span className="link-text">Dashboard</span></NavLink></li>
          <li className="nav-item"><NavLink to="/dashboard/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}><span className="link-text">Users</span></NavLink></li>
          <li className="nav-item"><NavLink to="/dashboard/admin/kyc" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}><span className="link-text">KYC</span></NavLink></li>
          <li className="nav-item"><NavLink to="/dashboard/admin/deposits" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}><span className="link-text">Deposits</span></NavLink></li>
          {isSuperAdmin && <li className="nav-item"><NavLink to="/dashboard/admin/admins" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}><span className="link-text">Admins</span></NavLink></li>}
          {isSuperAdmin && <li className="nav-item"><NavLink to="/dashboard/admin/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}><span className="link-text">Logs</span></NavLink></li>}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
