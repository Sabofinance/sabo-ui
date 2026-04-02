import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bidsApi from "../../lib/api/bids.api";
import { extractArray } from "../../lib/api/response";
import Pagination from "../../components/Pagination";
import "../../assets/css/HistoryPage.css";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

type BidTab = "pending" | "accepted" | "rejected" | "expired" | "withdrawn";

const MyBidsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<BidTab>("pending");
  const [bids, setBids] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const kycStatus = String((user as any)?.kyc_status || "").toLowerCase();
  const isVerified = kycStatus === "verified";
  const isPending = kycStatus.includes("pending");

  const kycMessage = useMemo(() => {
    if (isVerified) return "";
    if (isPending)
      return "KYC is currently pending review. Bids unlock once verified.";
    return "Complete your KYC to view bids.";
  }, [isPending, isVerified]);

  const load = async (nextTab: BidTab, page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await bidsApi.listMine({
        status: nextTab,
        page,
        limit: 15,
      });
      if (res.success) {
        const data = extractArray(res.data);
        setBids(data);
        const meta = (res.data as any)?.meta || (res.data as any);
        setTotalPages(meta.totalPages || meta.last_page || 1);
        setCurrentPage(page);
      } else {
        setBids([]);
        setError(res.error?.message || "Failed to load bids.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVerified) return;
    void load(tab, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isVerified]);

  const withdrawBid = async (bidId: string) => {
    const ok = window.confirm("Withdraw this pending bid?");
    if (!ok) return;
    setLoading(true);
    try {
      const res = await bidsApi.withdraw(bidId);
      if (!res.success) {
        toast.error(res.error?.message || "Failed to withdraw bid.");
        return;
      }
      toast.success("Bid withdrawn.");
      await load(tab);
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <main className="history-page">
        <div className="page-header">
          <h1 className="page-title">My Bids</h1>
        </div>
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            border: "1px solid #fde68a",
            background: "#fffbeb",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 4 }}>KYC required</div>
          <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>
            {kycMessage}
          </div>
          <button
            className="export-btn"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/dashboard/kyc")}
          >
            Complete KYC
          </button>
        </div>
      </main>
    );
  }

  const tabs: { key: BidTab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
    { key: "expired", label: "Expired" },
    { key: "withdrawn", label: "Withdrawn" },
  ];

  const formatRemaining = (bid: Record<string, unknown>) => {
    const expiresAt =
      bid.expiresAt ?? bid.expiry ?? bid.expires_at ?? bid.expirationAt ?? null;
    const createdAt = bid.createdAt ?? bid.created_at ?? bid.created ?? null;
    const expiresMs = expiresAt
      ? new Date(String(expiresAt)).getTime()
      : createdAt
        ? new Date(String(createdAt)).getTime() + 24 * 60 * 60 * 1000
        : 0;
    const now = Date.now();
    const ms = expiresMs - now;
    if (!Number.isFinite(ms)) return "";
    if (ms <= 0) return "Expired";
    const s = Math.floor(ms / 1000);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bids</h1>
          <p className="page-subtitle">Manage your bids across listings</p>
        </div>
        <button 
          className="export-btn" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: '#fff',
            color: '#0A1E28',
            border: '1px solid #e2e8f0'
          }} 
          onClick={() => void load(tab)}
          disabled={loading}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div
        className="tabs-container"
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Proposed Rate (NGN)</th>
              <th>Amount</th>
              <th>Status</th>
              {tab === "pending" && <th>Expiry</th>}
              {tab === "pending" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={tab === "pending" ? 6 : 4}
                  style={{ padding: 16, color: "#6b7280" }}
                >
                  Loading bids...
                </td>
              </tr>
            ) : bids.length === 0 ? (
              <tr>
                <td
                  colSpan={tab === "pending" ? 6 : 4}
                  style={{ padding: 16, color: "#6b7280" }}
                >
                  No bids in this tab.
                </td>
              </tr>
            ) : (
              bids.map((bid: any, idx) => (
                <tr key={String(bid.id ?? idx)}>
                  <td>{String(bid.id ?? bid.bidId ?? idx)}</td>
                  <td>
                    {String(
                      bid.proposed_rate_ngn ??
                        bid.proposedRateNgN ??
                        bid.proposed_rate_ngn ??
                        bid.proposed_rate ??
                        bid.rate_ngn ??
                        bid.proposedRate ??
                        "-",
                    )}
                  </td>
                  <td>{String(bid.amount ?? "-")}</td>
                  <td>{String(bid.status ?? bid.state ?? tab)}</td>
                  {tab === "pending" && <td>{formatRemaining(bid)}</td>}
                  {tab === "pending" && (
                    <td>
                      <button
                        className="page-number"
                        onClick={() => void withdrawBid(String(bid.id ?? idx))}
                        disabled={loading}
                      >
                        Withdraw
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(p) => void load(tab, p)} 
        isLoading={loading} 
      />
    </main>
  );
};

export default MyBidsPage;
