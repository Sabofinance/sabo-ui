import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import bidsApi from "../lib/api/bids.api";
import { useAuth } from "../context/AuthContext";
import PinDotsInput from "./PinDotsInput";

type ReceivedBidsModalProps = {
  sabitId: number;
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

const ReceivedBidsModal: React.FC<ReceivedBidsModalProps> = ({ sabitId, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pinSet = Boolean((user as any)?.transaction_pin_set);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bids, setBids] = useState<BidItem[]>([]);

  const [action, setAction] = useState<null | { type: "accept" | "reject"; bid: BidItem }>(null);
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatRemaining = (bid: BidItem) => {
    const expiresAt = bid.expiresAt ?? null;
    const createdAt = (bid as any).createdAt ?? (bid as any).created_at ?? null;
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
      const filtered = arr.filter((b) => String(b?.sabit_id ?? b?.sabitId ?? "") === String(sabitId));
      const mapped: BidItem[] = filtered.map((b, idx) => ({
        id: String(b.id ?? b.bidId ?? idx),
        buyerName: String(b.buyerName ?? b.buyer?.name ?? b.buyer_username ?? b.username ?? b.buyer ?? ""),
        proposedRateNgN: Number(b.proposed_rate_ngn ?? b.proposedRateNgN ?? b.proposed_rate_ngn ?? b.proposed_rate ?? b.rate_ngn ?? b.proposedRate ?? 0) || 0,
        amount: Number(b.amount ?? b.bid_amount ?? 0) || 0,
        expiresAt: b.expiresAt ?? b.expiry ?? b.expires_at ?? b.expirationAt ?? null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (action.type === "reject") {
      // Reason is optional in docs, but keep it user-provided if present.
      const trimmed = (reason || "").trim();
      if (!trimmed) {
        setReason("");
      }
    }

    setSubmitting(true);
    try {
      const bidId = action.bid.id;
      const res =
        action.type === "accept"
          ? await bidsApi.accept(bidId, { pin })
          : await bidsApi.reject(bidId, { pin, reason: (reason || "").trim() || undefined });

      if (!res.success) {
        toast.error(res.error?.message || "Action failed.");
        return;
      }
      toast.success(action.type === "accept" ? "Bid accepted." : "Bid rejected.");
      closeAction();
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const overlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={overlayClick} role="dialog" aria-modal="true">
      <div className="sell-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <h2 className="modal-title" style={{ marginTop: 10 }}>
          Received Bids
        </h2>
        <p className="modal-subtitle" style={{ marginBottom: 16 }}>
          Listing ID: <strong>{sabitId}</strong>
        </p>

        {loading && <p style={{ color: "#64748B" }}>Loading received bids...</p>}
        {error && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 700 }}>
            {error}
          </div>
        )}

        {!loading && !error && bids.length === 0 && <p style={{ color: "#64748B" }}>No received bids found.</p>}

        {!loading && bids.length > 0 && (
          <div style={{ overflow: "auto", borderRadius: 14, border: "1px solid #E2E8F0" }}>
            <table className="history-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Proposed Rate</th>
                  <th>Amount</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid.id}>
                    <td>{bid.buyerName || "—"}</td>
                    <td>₦{Number(bid.proposedRateNgN || 0).toFixed(2)}</td>
                    <td>{Number(bid.amount || 0).toFixed(2)}</td>
                    <td>{formatRemaining(bid)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="page-number" onClick={() => openAction("accept", bid)}>
                          Accept
                        </button>
                        <button className="page-number" onClick={() => openAction("reject", bid)}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {action && (
          <div className="modal-overlay" style={{ background: "rgba(0,0,0,0.35)" }}>
            <div className="sell-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <button className="modal-close-icon" onClick={closeAction} aria-label="Close modal">
                ×
              </button>
              <h2 className="modal-title" style={{ marginTop: 10 }}>
                {action.type === "accept" ? "Accept Bid" : "Reject Bid"}
              </h2>
              <p className="modal-subtitle" style={{ marginBottom: 16 }}>
                Bid ID: <strong>{action.bid.id}</strong>
              </p>

              {action.type === "reject" && (
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="input-label">Reason (optional)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: "100%", minHeight: 86, borderRadius: 12, padding: 12, border: "1px solid #E2E8F0" }}
                    placeholder="Add a short reason (optional)"
                  />
                </div>
              )}

              <PinDotsInput value={pin} onChange={setPin} label="Transaction PIN" />

              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <button type="button" className="action-btn" onClick={closeAction} disabled={submitting}>
                  Cancel
                </button>
                <button type="button" className="btn-submit-sabo" onClick={() => void submit()} disabled={submitting}>
                  {submitting ? "Processing..." : action.type === "accept" ? "Confirm Accept" : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedBidsModal;

