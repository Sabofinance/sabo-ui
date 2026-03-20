import React from 'react';
import '../assets/css/NotificationPopup.css';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

interface NotificationPopupProps {
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ onClose }) => {
  const toast = useToast();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch(type) {
      case 'trade':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'rate':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'offer':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        );
      case 'success':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'error':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
          </svg>
        );
      case 'info':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="10" x2="12" y2="16" strokeLinecap="round" />
            <line x1="12" y1="7" x2="12.01" y2="7" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => n.status === 'unread');
    if (!unread.length) return;

    try {
      await Promise.all(unread.map((n) => markAsRead(n.id)));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to mark notifications as read.');
    }
  };

  const handleNotificationClick = async (id: string) => {
    const item = notifications.find((n) => n.id === id);
    onClose();

    if (!item) return;
    if (item.status !== 'unread') return;

    try {
      await markAsRead(item.id);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update notification.');
    }
  };

  return (
    <>
      <div className="notification-overlay" onClick={onClose}></div>
      
      <div className="notification-panel">
        <div className="panel-header">
          <div className="header-title">
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount}</span>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="panel-actions">
          <button className="mark-read-btn" onClick={handleMarkAllRead} disabled={notifications.length === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mark all as read
          </button>
        </div>

        <div className="panel-list">
          {notifications.length === 0 ? (
            <p style={{ color: '#64748B', textAlign: 'center', margin: '1rem 0' }}>No notifications.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`list-item ${notification.status === 'unread' ? 'unread' : ''}`}
                onClick={() => void handleNotificationClick(notification.id)}
              >
                <div className="item-icon">
                  <div className={`icon-bg ${notification.type}`}>
                    {getIcon(notification.type)}
                  </div>
                </div>

                <div className="item-content">
                  <div className="item-header">
                    <div className="item-title">
                      <h4>{notification.title}</h4>
                    </div>
                    <span className="item-time">{notification.createdAt}</span>
                  </div>

                  <p className="item-message">{notification.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;