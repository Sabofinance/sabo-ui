import React from "react";
import { useNotifications } from "../context/NotificationContext";

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <span>Notifications</span>
        {unreadCount > 0 && <span className="notif-unread-indicator">{unreadCount}</span>}
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">No notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.status === "unread" ? "unread" : ""}`}
              onClick={() => n.status === "unread" && markAsRead(n.id)}
            >
              <div className={`notif-dot notif-dot-${n.type}`} />
              <div className="notif-content">
                <div className="notif-title">{n.title}</div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
