import React from 'react';
import '../assets/css/NotificationPopup.css';

interface NotificationPopupProps {
  onClose: () => void;
}

interface Notification {
  id: number;
  type: 'trade' | 'rate' | 'system' | 'offer';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  amount?: string;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ onClose }) => {
  // Mock data
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'trade',
      title: 'Trade Completed',
      message: 'You sold 500 GBP to Sarah.eth at ₦1,650',
      time: '5m',
      read: false,
      avatar: 'https://i.pravatar.cc/150?u=2',
      amount: '₦825,000'
    },
    {
      id: 2,
      type: 'rate',
      title: 'Rate Alert',
      message: 'GBP/NGN rate increased by 2.4%',
      time: '1h',
      read: false,
      amount: '₦1,650 → ₦1,689'
    },
    {
      id: 3,
      type: 'offer',
      title: 'New Buy Offer',
      message: 'MikeCrypto wants to buy 2,500 NGN',
      time: '2h',
      read: false,
      avatar: 'https://i.pravatar.cc/150?u=3',
      amount: '₦3,950,000'
    },
    {
      id: 4,
      type: 'system',
      title: 'Welcome to SABO!',
      message: 'Complete your profile to start trading',
      time: '1d',
      read: true
    },
    {
      id: 5,
      type: 'trade',
      title: 'Trade Completed',
      message: 'You bought 300 GBP from EmmaTrades',
      time: '1d',
      read: true,
      avatar: 'https://i.pravatar.cc/150?u=4',
      amount: '₦504,000'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const handleMarkAllRead = () => {
    console.log('Mark all as read');
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    onClose();
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
          <button className="mark-read-btn" onClick={handleMarkAllRead}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mark all as read
          </button>
        </div>

        <div className="panel-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`list-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="item-icon">
                {notification.avatar ? (
                  <img src={notification.avatar} alt="" className="avatar" />
                ) : (
                  <div className={`icon-bg ${notification.type}`}>
                    {getIcon(notification.type)}
                  </div>
                )}
              </div>

              <div className="item-content">
                <div className="item-header">
                  <div className="item-title">
                    <h4>{notification.title}</h4>
                  </div>
                  <span className="item-time">{notification.time}</span>
                </div>
                
                <p className="item-message">{notification.message}</p>
                
                {notification.amount && (
                  <div className="item-amount">
                    {notification.amount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;