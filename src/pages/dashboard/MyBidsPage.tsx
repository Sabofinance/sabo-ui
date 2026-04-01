import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bidsApi from "../../lib/api/bids.api";
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

  const kycStatus = String((user as any)?.kyc_status || "").toLowerCase();
  const isVerified = kycStatus === "verified";
  const isPending = kycStatus.includes("pending");

  const kycMessage = useMemo(() => {
    if (isVerified) return "";
    if (isPending) return "KYC is currently pending review. Bids unlock once verified.";
    return "Complete your KYC to view bids.";
  }, [isPending, isVerified]);

  const load = async (nextTab: BidTab) => {
    setLoading(true);
    setError("");
    try {
      const res = await bidsApi.listMine({ status: nextTab, page: 1, limit: 20 });
      if (res.success && Array.isArray(res.data)) setBids(res.data);
      else setBids([]);
      if (!res.success) setError(res.error?.message || "Failed to load bids.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVerified) return;
    void load(tab);
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
        <div style={{ padding: 16, borderRadius: 14, border: "1px solid #fde68a", background: "#fffbeb", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>KYC required</div>
          <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>{kycMessage}</div>
          <button className="export-btn" style={{ marginTop: 12 }} onClick={() => navigate("/dashboard/kyc")}>
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
    const expiresAt = bid.expiresAt ?? bid.expiry ?? bid.expires_at ?? bid.expirationAt ?? null;
    const createdAt = bid.createdAt ?? bid.created_at ?? bid.created ?? null;
    const expiresMs = expiresAt ? new Date(String(expiresAt)).getTime() : createdAt ? new Date(String(createdAt)).getTime() + 24 * 60 * 60 * 1000 : 0;
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
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap');

  .mbp-page {
    font-family: 'DM Sans', sans-serif;
    padding: 28px 24px;
    max-width: 900px;
    box-sizing: border-box;
  }
  .mbp-page * { box-sizing: border-box; }

  /* header */
  .mbp-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 22px; gap: 12px; flex-wrap: wrap;
  }
  .mbp-title {
    margin: 0; font-size: 26px; font-weight: 800;
    color: #0d1f1e; letter-spacing: -0.6px;
  }
  .mbp-subtitle { margin: 4px 0 0; font-size: 13px; color: #7a9c99; font-weight: 500; }
  .mbp-header-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    background: #0d1f1e; color: #C8F135;
    font-size: 12px; font-weight: 800; letter-spacing: 0.02em;
  }

  /* tabs */
  .mbp-tabs {
    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
  }
  .mbp-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 20px;
    border: 1.5px solid #e0ebe9; background: transparent;
    color: #7a9c99; font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: all 0.15s;
  }
  .mbp-tab:hover:not(.active) { border-color: #b0ccc9; color: #3a6060; }
  .mbp-tab-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; transition: background 0.15s; }

  /* card */
  .mbp-card {
    background: #fff;
    border: 1px solid #e0ebe9;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(13,31,30,0.05);
  }

  /* table */
  .mbp-table-wrap { overflow-x: auto; }
  .mbp-table {
    width: 100%; border-collapse: collapse;
    font-family: 'DM Sans', sans-serif;
  }
  .mbp-table thead tr {
    background: #0d1f1e;
  }
  .mbp-table thead th {
    padding: 14px 18px;
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #7a9c99; text-align: left; white-space: nowrap;
  }
  .mbp-row {
    border-bottom: 1px solid #f0f7f6;
    transition: background 0.12s;
  }
  .mbp-row:last-child { border-bottom: none; }
  .mbp-row:hover { background: #f8fcfb; }
  .mbp-table td { padding: 14px 18px; vertical-align: middle; }

  .mbp-id { font-size: 12px; font-weight: 700; color: #7a9c99; font-variant-numeric: tabular-nums; }
  .mbp-rate { display: inline-flex; align-items: baseline; gap: 2px; font-size: 15px; font-weight: 800; color: #0d1f1e; letter-spacing: -0.3px; }
  .mbp-rate-symbol { font-size: 12px; font-weight: 700; color: #7a9c99; }
  .mbp-amount { font-size: 14px; font-weight: 700; color: #3a6060; }

  .mbp-status-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.05em;
    text-transform: capitalize; border: 1px solid transparent;
  }

  .mbp-timer {
    font-size: 13px; font-weight: 800; color: #b45309;
    font-variant-numeric: tabular-nums; letter-spacing: 0.03em;
    background: rgba(251,191,36,0.1); padding: 4px 10px; border-radius: 8px;
  }

  /* withdraw btn */
  .mbp-withdraw-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 10px;
    border: 1.5px solid #e0ebe9; background: transparent;
    color: #991b1b; font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: inherit; transition: all 0.15s;
  }
  .mbp-withdraw-btn:hover:not(:disabled) {
    background: #fee2e2; border-color: #fca5a5; color: #7f1d1d;
  }
  .mbp-withdraw-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  @keyframes mbpSpin { to { transform: rotate(360deg) } }
  .mbp-btn-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid rgba(153,27,27,0.2); border-top-color: #991b1b;
    animation: mbpSpin 0.65s linear infinite; display: inline-block;
  }

  /* empty / loading */
  .mbp-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
    padding: 56px 24px; color: #7a9c99;
    font-size: 14px; font-weight: 600;
  }
  @keyframes mbpSpinLg { to { transform: rotate(360deg) } }
  .mbp-spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid #e0ebe9; border-top-color: #C8F135;
    animation: mbpSpinLg 0.7s linear infinite;
  }

  /* error */
  .mbp-error {
    margin: 16px; padding: 12px 16px; border-radius: 12px;
    background: #fff1f1; border: 1px solid #fecaca;
    color: #991b1b; font-weight: 700; font-size: 13px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  /* KYC gate */
  .mbp-kyc-card {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 20px; border-radius: 16px;
    background: #fffbeb; border: 1.5px solid rgba(251,191,36,0.4);
    flex-wrap: wrap;
  }
  .mbp-kyc-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.3);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .mbp-kyc-heading { font-size: 15px; font-weight: 800; color: #0d1f1e; margin-bottom: 4px; }
  .mbp-kyc-body { font-size: 13px; color: #6b7280; line-height: 1.5; }
  .mbp-kyc-btn {
    margin-left: auto; align-self: center;
    padding: 10px 20px; border-radius: 12px; border: none;
    background: #0d1f1e; color: #C8F135;
    font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit;
    transition: all 0.15s; white-space: nowrap;
  }
  .mbp-kyc-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,31,30,0.2); }
`;
  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bids</h1>
          <p className="page-subtitle">Manage your bids across listings</p>
        </div>
      </div>

      <div className="tabs-container" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
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
                <td colSpan={tab === "pending" ? 6 : 4} style={{ padding: 16, color: "#6b7280" }}>
                  Loading bids...
                </td>
              </tr>
            ) : bids.length === 0 ? (
              <tr>
                <td colSpan={tab === "pending" ? 6 : 4} style={{ padding: 16, color: "#6b7280" }}>
                  No bids in this tab.
                </td>
              </tr>
            ) : (
              bids.map((bid: any, idx) => (
                <tr key={String(bid.id ?? idx)}>
                  <td>{String(bid.id ?? bid.bidId ?? idx)}</td>
                  <td>{String(bid.proposed_rate_ngn ?? bid.proposedRateNgN ?? bid.proposed_rate_ngn ?? bid.proposed_rate ?? bid.rate_ngn ?? bid.proposedRate ?? "-")}</td>
                  <td>{String(bid.amount ?? "-")}</td>
                  <td>{String(bid.status ?? bid.state ?? tab)}</td>
                  {tab === "pending" && <td>{formatRemaining(bid)}</td>}
                  {tab === "pending" && (
                    <td>
                      <button className="page-number" onClick={() => void withdrawBid(String(bid.id ?? idx))} disabled={loading}>
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
          <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 600 }}>
            {error}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyBidsPage;