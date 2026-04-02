import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import bidsApi from "../lib/api/bids.api";
import { useAuth } from "../context/AuthContext";
import PinDotsInput from "./PinDotsInput";

type ReceivedBidsModalProps = {
  sabitId: number | string;
  onClose: () => void;
};

type BidItem = Record<string, unknown> & {
  id: string;
  buyerName?: string;
  proposedRateNgN?: number;
  amount?: number;
  expiresAt?: string | null;
  sabit_id?: string;
};

const ReceivedBidsModal: React.FC<ReceivedBidsModalProps> = ({
  sabitId,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pinSet = Boolean((user as any)?.transaction_pin_set);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bids, setBids] = useState<BidItem[]>([]);
  const [action, setAction] = useState<null | {
    type: "accept" | "reject";
    bid: BidItem;
  }>(null);
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatRemaining = (bid: BidItem) => {
    const expiresAt = bid.expiresAt ?? null;
    const createdAt = (bid as any).createdAt ?? (bid as any).created_at ?? null;
    const expiresMs = expiresAt
      ? new Date(String(expiresAt)).getTime()
      : createdAt
        ? new Date(String(createdAt)).getTime() + 24 * 60 * 60 * 1000
        : 0;
    const ms = expiresMs - Date.now();
    if (!Number.isFinite(ms) || ms <= 0) return "Expired";
    const s = Math.floor(ms / 1000);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await bidsApi.listReceived({});
      if (!res.success) {
        setError(res.error?.message || "Failed to load received bids.");
        setBids([]);
        return;
      }
      const arr = Array.isArray(res.data) ? (res.data as any[]) : [];
      const filtered = arr.filter(
        (b) => String(b?.sabit_id ?? b?.sabitId ?? "") === String(sabitId),
      );
      const mapped: BidItem[] = filtered.map((b, idx) => ({
        id: String(b.id ?? b.bidId ?? idx),
        buyerName: String(
          b.buyerName ??
            b.buyer?.name ??
            b.buyer_username ??
            b.username ??
            b.buyer ??
            "",
        ),
        proposedRateNgN:
          Number(
            b.proposed_rate_ngn ??
              b.proposedRateNgN ??
              b.proposed_rate ??
              b.rate_ngn ??
              b.proposedRate ??
              0,
          ) || 0,
        amount: Number(b.amount ?? b.bid_amount ?? 0) || 0,
        expiresAt:
          b.expiresAt ?? b.expiry ?? b.expires_at ?? b.expirationAt ?? null,
        sabit_id: String(b.sabit_id ?? b.sabitId ?? ""),
      }));
      setBids(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load received bids.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [sabitId]);

  const openAction = (type: "accept" | "reject", bid: BidItem) => {
    if (!pinSet) {
      toast.error("Transaction PIN is required.");
      navigate("/dashboard/transaction-pin");
      return;
    }
    setAction({ type, bid });
    setPin("");
    setReason("");
    setSubmitting(false);
  };

  const closeAction = () => {
    setAction(null);
    setPin("");
    setReason("");
  };

  const submit = async () => {
    if (!action) return;
    if (!/^\d{6}$/.test(pin)) {
      toast.error("PIN must be exactly 6 digits.");
      return;
    }
    setSubmitting(true);
    try {
      const res =
        action.type === "accept"
          ? await bidsApi.accept(action.bid.id, { pin })
          : await bidsApi.reject(action.bid.id, {
              pin,
              reason: (reason || "").trim() || undefined,
            });
      if (!res.success) {
        toast.error(res.error?.message || "Action failed.");
        return;
      }
      toast.success(
        action.type === "accept" ? "Bid accepted." : "Bid rejected.",
      );
      closeAction();
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap');
        .rbm * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .rbm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(8,18,17,0.72); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
          animation: rbmFade 0.2s ease;
        }
        @keyframes rbmFade { from { opacity: 0 } to { opacity: 1 } }

        .rbm-card {
          width: 100%; max-width: 660px; background: #f5f9f8;
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(8,18,17,0.4), 0 0 0 1px rgba(200,241,53,0.08);
          animation: rbmUp 0.28s cubic-bezier(0.34,1.26,0.64,1);
          display: flex; flex-direction: column; max-height: 90vh;
        }
        @keyframes rbmUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }

        /* header */
        .rbm-header {
          background: #0d1f1e; padding: 24px 24px 20px;
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .rbm-header::before {
          content: ''; position: absolute; top: -50px; right: -50px;
          width: 180px; height: 180px; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,241,53,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .rbm-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 20px; margin-bottom: 12px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          background: rgba(200,241,53,0.12); color: #C8F135; border: 1px solid rgba(200,241,53,0.3);
        }
        .rbm-title { margin: 0 0 4px; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .rbm-subtitle { margin: 0; font-size: 13px; color: #7a9c99; font-weight: 500; }
        .rbm-subtitle strong { color: #b0ccc9; font-weight: 700; }
        .rbm-close {
          position: absolute; top: 18px; right: 18px;
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06);
          color: #b0ccc9; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .rbm-close:hover { background: rgba(200,241,53,0.15); color: #C8F135; border-color: rgba(200,241,53,0.3); }

        /* body */
        .rbm-body { padding: 20px 22px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px; }

        /* bid card */
        .rbm-bid-card {
          background: #fff; border: 1.5px solid #e0ebe9; border-radius: 18px;
          padding: 16px 18px; display: flex; flex-direction: column; gap: 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .rbm-bid-card:hover { border-color: #c0d5d2; box-shadow: 0 4px 16px rgba(13,31,30,0.06); }

        .rbm-bid-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .rbm-bid-id { font-size: 11px; font-weight: 700; color: #b0ccc9; letter-spacing: 0.06em; text-transform: uppercase; }

        .rbm-buyer {
          display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;
        }
        .rbm-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: #0d1f1e; display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #C8F135; letter-spacing: -0.3px;
        }
        .rbm-buyer-name { font-size: 14px; font-weight: 800; color: #0d1f1e; }
        .rbm-buyer-label { font-size: 11px; color: #7a9c99; font-weight: 600; }

        .rbm-expiry {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700; color: #b45309;
          background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2);
          padding: 5px 10px; border-radius: 10px; white-space: nowrap; flex-shrink: 0;
          font-variant-numeric: tabular-nums;
        }

        /* stats row */
        .rbm-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .rbm-stat {
          flex: 1; min-width: 100px;
          background: #f5f9f8; border: 1px solid #e0ebe9; border-radius: 12px; padding: 10px 14px;
        }
        .rbm-stat-label { font-size: 11px; font-weight: 700; color: #7a9c99; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .rbm-stat-value { font-size: 16px; font-weight: 800; color: #0d1f1e; letter-spacing: -0.3px; }
        .rbm-stat-value em { font-size: 11px; font-style: normal; color: #7a9c99; margin-left: 3px; font-weight: 600; }

        /* action buttons */
        .rbm-actions { display: flex; gap: 8px; }
        .rbm-btn-accept {
          flex: 1; padding: 10px 16px; border-radius: 12px; border: none;
          background: #C8F135; color: #0d1f1e; font-size: 13px; font-weight: 800;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .rbm-btn-accept:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,241,53,0.3); }
        .rbm-btn-reject {
          flex: 1; padding: 10px 16px; border-radius: 12px;
          border: 1.5px solid #fca5a5; background: rgba(254,226,226,0.4);
          color: #b91c1c; font-size: 13px; font-weight: 800;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .rbm-btn-reject:hover { background: #fee2e2; border-color: #f87171; }

        /* skeleton */
        @keyframes rbmShimmer { to { background-position: -200% 0 } }
        .rbm-skeleton {
          height: 130px; border-radius: 18px;
          background: linear-gradient(90deg, #f0f7f6 25%, #e4f0ee 50%, #f0f7f6 75%);
          background-size: 200% 100%; animation: rbmShimmer 1.3s infinite;
        }

        /* empty / error */
        .rbm-empty {
          text-align: center; padding: 48px 24px;
          background: #fff; border: 1.5px dashed #e0ebe9; border-radius: 18px;
        }
        .rbm-empty-icon { font-size: 34px; margin-bottom: 10px; }
        .rbm-empty-title { font-size: 15px; font-weight: 800; color: #0d1f1e; margin: 0 0 5px; }
        .rbm-empty-msg   { font-size: 13px; color: #7a9c99; margin: 0; }

        .rbm-error {
          padding: 12px 16px; border-radius: 14px;
          background: #fff1f1; border: 1px solid #fecaca;
          color: #991b1b; font-size: 13px; font-weight: 700;
          display: flex; gap: 8px; align-items: flex-start;
        }

        /* ── action sub-modal ── */
        .rbm-sub-overlay {
          position: fixed; inset: 0; z-index: 1100;
          background: rgba(8,18,17,0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
          animation: rbmFade 0.15s ease;
        }
        .rbm-sub-card {
          width: 100%; max-width: 440px; background: #f5f9f8;
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(8,18,17,0.45);
          animation: rbmUp 0.22s cubic-bezier(0.34,1.26,0.64,1);
        }
        .rbm-sub-header {
          padding: 20px 22px 16px; display: flex; align-items: flex-start; justify-content: space-between;
        }
        .rbm-sub-header.accept { background: linear-gradient(135deg, #0d1f1e, #1a3a38); }
        .rbm-sub-header.reject { background: linear-gradient(135deg, #1c0a0a, #3a1010); }
        .rbm-sub-title { margin: 0 0 4px; font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.4px; }
        .rbm-sub-meta  { margin: 0; font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 600; }
        .rbm-sub-close {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.6); font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .rbm-sub-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .rbm-sub-body { padding: 18px 22px 22px; display: flex; flex-direction: column; gap: 14px; }

        /* bid summary inside sub-modal */
        .rbm-sub-summary {
          background: #0d1f1e; border-radius: 14px; padding: 14px 16px;
          display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .rbm-sub-sum-label { font-size: 12px; color: #7a9c99; font-weight: 600; }
        .rbm-sub-sum-value { font-size: 16px; font-weight: 800; color: #C8F135; letter-spacing: -0.3px; }

        /* reason textarea */
        .rbm-textarea {
          width: 100%; min-height: 80px; border-radius: 12px; padding: 12px 14px;
          border: 2px solid #e0ebe9; background: #fff; font-size: 14px; font-weight: 500;
          color: #0d1f1e; outline: none; resize: vertical; font-family: inherit;
          transition: border-color 0.15s;
        }
        .rbm-textarea:focus { border-color: #C8F135; }
        .rbm-textarea::placeholder { color: #c0d5d2; }

        .rbm-pin-wrap { background: #fff; border: 1px solid #e0ebe9; border-radius: 16px; padding: 16px 18px; }

        .rbm-sub-actions { display: flex; gap: 10px; }
        .rbm-sub-cancel {
          flex: 1; padding: 13px; border-radius: 14px;
          border: 2px solid #e0ebe9; background: transparent;
          color: #3a6060; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .rbm-sub-cancel:hover:not(:disabled) { border-color: #0d1f1e; color: #0d1f1e; }
        .rbm-sub-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
        .rbm-sub-confirm {
          flex: 2; padding: 13px; border-radius: 14px; border: none;
          font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
          transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rbm-sub-confirm.accept { background: #C8F135; color: #0d1f1e; }
        .rbm-sub-confirm.reject { background: #b91c1c; color: #fff; }
        .rbm-sub-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .rbm-sub-confirm:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        @keyframes rbmSpin { to { transform: rotate(360deg) } }
        .rbm-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.25); border-top-color: currentColor;
          animation: rbmSpin 0.65s linear infinite;
        }
        .rbm-sub-confirm.accept .rbm-spinner { border-color: rgba(13,31,30,0.2); border-top-color: #0d1f1e; }
      `}</style>

      {/* MAIN MODAL */}
      <div
        className="rbm rbm-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="rbm-card" onClick={(e) => e.stopPropagation()}>
          {/* HEADER */}
          <div className="rbm-header">
            <button className="rbm-close" onClick={onClose} aria-label="Close">
              ×
            </button>
            <div className="rbm-badge">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4" />
              </svg>
              Incoming Bids
            </div>
            <h2 className="rbm-title">Received Bids</h2>
            <p className="rbm-subtitle">
              Listing ID: <strong>#{sabitId}</strong>
            </p>
          </div>

          {/* BODY */}
          <div className="rbm-body">
            {loading ? (
              [1, 2].map((i) => <div key={i} className="rbm-skeleton" />)
            ) : error ? (
              <div className="rbm-error">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>

                {error}
              </div>
            ) : bids.length === 0 ? (
              <div className="rbm-empty">
                    <div className="rbm-empty-icon">
                      
                </div>
                <p className="rbm-empty-title">No bids received</p>
                <p className="rbm-empty-msg">
                  No one has placed a bid on this listing yet.
                </p>
              </div>
            ) : (
              bids.map((bid) => {
                const initials = (bid.buyerName || "?")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div key={bid.id} className="rbm-bid-card">
                    {/* top row */}
                    <div className="rbm-bid-top">
                      <div className="rbm-buyer">
                        <div className="rbm-avatar">{initials}</div>
                        <div>
                          <div className="rbm-buyer-name">
                            {bid.buyerName || "Unknown buyer"}
                          </div>
                          <div className="rbm-buyer-label">Bid #{bid.id}</div>
                        </div>
                      </div>
                      <div className="rbm-expiry">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatRemaining(bid)}
                      </div>
                    </div>

                    {/* stats */}
                    <div className="rbm-stats">
                      <div className="rbm-stat">
                        <div className="rbm-stat-label">Proposed Rate</div>
                        <div className="rbm-stat-value">
                          ₦
                          {Number(bid.proposedRateNgN || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                          <em>NGN</em>
                        </div>
                      </div>
                      <div className="rbm-stat">
                        <div className="rbm-stat-label">Amount</div>
                        <div className="rbm-stat-value">
                          {Number(bid.amount || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="rbm-stat">
                        <div className="rbm-stat-label">Total Value</div>
                        <div className="rbm-stat-value">
                          ₦
                          {(
                            Number(bid.proposedRateNgN || 0) *
                            Number(bid.amount || 0)
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="rbm-actions">
                      <button
                        className="rbm-btn-accept"
                        onClick={() => openAction("accept", bid)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Accept
                      </button>
                      <button
                        className="rbm-btn-reject"
                        onClick={() => openAction("reject", bid)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ACTION SUB-MODAL */}
      {action && (
        <div
          className="rbm rbm-sub-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAction();
          }}
        >
          <div className="rbm-sub-card" onClick={(e) => e.stopPropagation()}>
            <div className={`rbm-sub-header ${action.type}`}>
              <div>
                <h3 className="rbm-sub-title">
                  {action.type === "accept" ? "✓ Accept Bid" : "✕ Reject Bid"}
                </h3>
                <p className="rbm-sub-meta">
                  Bid #{action.bid.id} · {action.bid.buyerName || "Unknown"}
                </p>
              </div>
              <button
                className="rbm-sub-close"
                onClick={closeAction}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="rbm-sub-body">
              {/* bid summary */}
              <div className="rbm-sub-summary">
                <div>
                  <div className="rbm-sub-sum-label">Proposed rate</div>
                  <div className="rbm-sub-sum-value">
                    ₦
                    {Number(action.bid.proposedRateNgN || 0).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}{" "}
                    NGN
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="rbm-sub-sum-label">Amount</div>
                  <div className="rbm-sub-sum-value">
                    {Number(action.bid.amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* reason (reject only) */}
              {action.type === "reject" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#7a9c99",
                      marginBottom: 8,
                    }}
                  >
                    Reason (optional)
                  </label>
                  <textarea
                    className="rbm-textarea"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Add a short reason (optional)"
                  />
                </div>
              )}

              {/* PIN */}
              <div className="rbm-pin-wrap">
                <PinDotsInput
                  value={pin}
                  onChange={setPin}
                  label="Transaction PIN"
                />
              </div>

              {/* buttons */}
              <div className="rbm-sub-actions">
                <button
                  className="rbm-sub-cancel"
                  onClick={closeAction}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className={`rbm-sub-confirm ${action.type}`}
                  onClick={() => void submit()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="rbm-spinner" /> Processing…
                    </>
                  ) : action.type === "accept" ? (
                    "Confirm Accept →"
                  ) : (
                    "Confirm Reject →"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceivedBidsModal;
