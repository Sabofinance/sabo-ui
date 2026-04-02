import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { toast } from "react-toastify";
import "../../assets/css/HistoryPage.css";
import "../../assets/css/NotificationsPage.css";
import notificationsApi from "../../lib/api/notifications.api";
import { extractArray } from "../../lib/api/response";
import Pagination from "../../components/Pagination";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchNotifications: refreshGlobal } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await notificationsApi.list({ page, limit: 20 });
      if (res.success) {
        const data = extractArray(res.data);
        setNotifications(data);
        const meta = (res.data as any)?.meta || (res.data as any);
        setTotalPages(meta.totalPages || meta.last_page || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(currentPage);
  }, [load]);

  const handleMarkRead = async (
    id: string,
    status: string,
    type: string,
    dataId?: string,
  ) => {
    if (status === "unread") {
      try {
        await notificationsApi.markRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "read" } : n)),
        );
        void refreshGlobal();
      } catch (err) {
        console.error("Failed to mark read", err);
      }
    }

    // Deep-linking logic based on type and dataId
    if (type === "trade") navigate(`/dashboard/trade/${dataId}`);
    else if (type === "deposit") navigate(`/dashboard/deposits/${dataId}`);
    else if (type === "withdrawal")
      navigate(`/dashboard/withdrawals/${dataId}`);
    else if (type === "bid") navigate(`/dashboard/trades`);
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await notificationsApi.markAllRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
        void refreshGlobal();
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <main className="history-page notifications-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated on your account activity</p>
        </div>
        <button
          className="export-btn"
          onClick={handleMarkAllRead}
          disabled={markingAll || notifications.length === 0}
        >
          {markingAll ? "Processing..." : "Mark all as read"}
        </button>
      </div>

      <div className="notifications-list-container">
        {notifications.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>We'll notify you when something important happens.</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-card ${n.status === "unread" ? "unread" : ""}`}
                  onClick={() =>
                    handleMarkRead(
                      n.id,
                      n.status,
                      n.type,
                      n.dataId || n.trade_id || n.id,
                    )
                  }
                >
                  <div className={`type-indicator ${n.type}`} />
                  <div className="notif-body">
                    <div className="notif-main">
                      <h4 className="notif-title">{n.title}</h4>
                      <p className="notif-message">{n.message}</p>
                    </div>
                    <div className="notif-meta">
                      <span className="notif-date">
                        {new Date(n.createdAt || n.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {n.status === "unread" && <span className="unread-dot" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(p) => void load(p)} 
              isLoading={loading} 
            />
          </>
        )}

        {loading && notifications.length === 0 && (
          <div className="loading-skeletons">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default NotificationsPage;
