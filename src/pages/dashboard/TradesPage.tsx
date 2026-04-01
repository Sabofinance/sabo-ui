import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import tradesApi from "../../lib/api/trades.api";
import { extractArray } from "../../lib/api/response";
import "../../assets/css/HistoryPage.css";
import { useAuth } from "../../context/AuthContext";

type TradeStatus = "initiated" | "escrowed" | "confirmed" | "completed" | "cancelled" | "disputed";

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  total: number;
  status: TradeStatus;
  createdAt: string;
  counterparty: {
    name: string;
    avatar: string;
  };
}

const TradesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const kycStatus = String((user as any)?.kyc_status || "").toLowerCase();
  const isVerified = kycStatus === "verified";

  const loadTrades = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await tradesApi.list();
      if (res.success) {
        const data = extractArray(res.data);
        const mapped: Trade[] = data.map((t: any) => ({
          id: String(t.id || t.tradeId),
          type: t.type === 'sell' ? 'sell' : 'buy',
          currency: String(t.currency || 'NGN'),
          amount: Number(t.amount || 0),
          rate: Number(t.rate || 0),
          total: Number(t.total || t.value || (Number(t.amount) * Number(t.rate))),
          status: String(t.status || 'initiated') as TradeStatus,
          createdAt: String(t.createdAt || t.created_at || new Date().toISOString()),
          counterparty: {
            name: String(t.counterpartyName || t.counterparty?.name || 'Trader'),
            avatar: String(t.counterpartyAvatar || t.counterparty?.avatar || ''),
          }
        }));
        setTrades(mapped);
      } else {
        setError(res.error?.message || "Failed to load trades.");
      }
    } catch (e: any) {
      setError(e?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerified) void loadTrades();
  }, [isVerified]);

  const filteredTrades = trades.filter(t => {
    const isActive = ['initiated', 'escrowed', 'confirmed', 'disputed'].includes(t.status);
    return activeTab === 'active' ? isActive : !isActive;
  });

  const getStatusBadge = (status: TradeStatus) => {
    const labels: Record<TradeStatus, string> = {
      initiated: "Initiated",
      escrowed: "In Escrow",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Disputed"
    };
    const className = status === 'completed' ? 'completed' : (status === 'cancelled' ? 'cancelled' : (status === 'disputed' ? 'disputed' : 'pending'));
    return <span className={`status-badge ${className}`}>{labels[status]}</span>;
  };

  if (!isVerified) {
    return (
      <main className="history-page">
        <div className="page-header">
          <h1 className="page-title">My Trades</h1>
        </div>
        <div style={{ padding: 16, borderRadius: 14, border: "1px solid #fde68a", background: "#fffbeb", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>KYC required</div>
          <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>Complete your KYC to view trades.</div>
          <button className="export-btn" style={{ marginTop: 12 }} onClick={() => navigate("/dashboard/kyc")}>
            Complete KYC
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Trades</h1>
          <p className="page-subtitle">Track your active and past trades</p>
        </div>
      </div>

      <div className="tabs-container" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active Trades</button>
        <button className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Past Trades</button>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Counterparty</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 16, color: "#64748b" }}>Loading trades...</td></tr>
            ) : filteredTrades.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 16, color: "#64748b" }}>No trades found.</td></tr>
            ) : (
              filteredTrades.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>
                    <div className="trader-cell">
                      <img src={t.counterparty.avatar || 'https://via.placeholder.com/32'} alt="" className="trader-avatar" />
                      <span className="trader-name">{t.counterparty.name}</span>
                    </div>
                  </td>
                  <td><span className={`type-badge ${t.type}`}>{t.type.toUpperCase()}</span></td>
                  <td>{t.amount} {t.currency}</td>
                  <td>{getStatusBadge(t.status)}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="page-number" onClick={() => navigate(`/dashboard/trade/${t.id}`)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default TradesPage;
