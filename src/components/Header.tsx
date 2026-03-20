// src/components/Header.tsx
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import '../assets/css/NotificationDropdown.css';
import { NavLink } from 'react-router-dom';
import '../assets/css/Header.css';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo linking to home */}
        <NavLink to="/" className="logo">
          sabo<span>.</span>
        </NavLink>

        <nav className="nav-pill">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>About Us</NavLink>
          <NavLink to="/features" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Features</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>
          <NavLink to="/faq" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>FAQ</NavLink>
        </nav>

        <div className="header-auth" style={{ position: 'relative' }}>
          <button
            className="notif-bell"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            style={{ background: 'none', border: 'none', marginRight: 16, cursor: 'pointer', position: 'relative' }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {notifOpen && <NotificationDropdown />}
          <NavLink to="/signup">
            <button className="btn-join">Join Us</button>
          </NavLink>
          <NavLink to="/login">
            <button className="btn-login-text">Log in</button>
          </NavLink>
        </div>

        <button 
          className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            {/* Mobile logo linking to home */}
            <NavLink to="/" className="mobile-logo" onClick={closeMenu}>
              sabo<span>.</span>
            </NavLink>
          </div>
          
          <nav className="mobile-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={closeMenu} end>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={closeMenu}>About Us</NavLink>
            <NavLink to="/features" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={closeMenu}>Features</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={closeMenu}>Contact</NavLink>
            <NavLink to="/faq" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={closeMenu}>FAQ</NavLink>
          </nav>

          <div className="mobile-auth">
            <NavLink to="/login" onClick={closeMenu}>
              <button className="mobile-login">Log in</button>
            </NavLink>
            <NavLink to="/signup" onClick={closeMenu}>
              <button className="mobile-join">Join Us</button>
            </NavLink>
          </div>
        </div>
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </header>
  );
};
