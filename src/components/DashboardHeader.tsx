import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotificationPopup from './NotificationPopup';
import { useSidebar } from '../context/SidebarContext';
import '../assets/css/DashboardHeader.css';

const DashboardHeader: React.FC = () => {
  const { toggle } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = 3;

  return (
    <header className="dashboard-header">

      {/* Hamburger — mobile only */}
      <button
        className="hamburger-btn"
        onClick={toggle}
        aria-label="Open navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Brand name — mobile only, centred */}
      <span className="header-brand-mobile">sabo</span>

      <div className="header-right">

        {/* Notifications */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className={`notification-icon ${notificationsOpen ? 'active' : ''}`}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          {notificationsOpen && (
            <NotificationPopup onClose={() => setNotificationsOpen(false)} />
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="profile-dropdown" ref={dropdownRef}>
          <button
            className={`profile-trigger ${profileOpen ? 'active' : ''}`}
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <img
              src="https://i.pravatar.cc/150?u=akingbade"
              alt="Mrs Akingbade"
              className="profile-avatar"
            />
            <div className="profile-info">
              <span className="profile-name">Mrs Akingbade</span>
              <span className="profile-role">User</span>
            </div>
            <svg
              className={`dropdown-arrow ${profileOpen ? 'open' : ''}`}
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <img
                  src="https://i.pravatar.cc/150?u=akingbade"
                  alt="Mrs Akingbade"
                  className="dropdown-avatar"
                />
                <div className="dropdown-user-info">
                  <span className="dropdown-user-name">Mrs Akingbade</span>
                  <span className="dropdown-user-email">akingbade@sabo.com</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <Link to="/dashboard/profile" className="dropdown-item"
                onClick={() => setProfileOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>My Profile</span>
              </Link>

              <Link to="/dashboard/settings" className="dropdown-item"
                onClick={() => setProfileOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82" />
                </svg>
                <span>Settings</span>
              </Link>

              <div className="dropdown-divider"></div>

              <Link to="/" className="dropdown-item logout"
                onClick={() => setProfileOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;