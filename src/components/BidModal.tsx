import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import bidsApi from "../lib/api/bids.api";
import type { ApiEnvelope } from "../lib/api/response";
import PinDotsInput from "./PinDotsInput";

type Props = {
  listing: {
    id: number | string;
    rate_ngn: number;
    available: number;
    currency: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
  onPinNotSet?: () => void;
};

const toMoneyNumber = (raw: string) => Number(String(raw).replace(/[^0-9.]/g, "")) || 0;

const BidModal: React.FC<Props> = ({ listing, onClose, onSuccess, onPinNotSet }) => {
  const [amount, setAmount] = useState<string>("");
  const [proposedRate, setProposedRate] = useState<string>("");
  const [pin, setPin] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string>("");

  const available = listing.available || 0;
  const listingRate = listing.rate_ngn || 0;

  const amountNum = useMemo(() => toMoneyNumber(amount), [amount]);
  const rateNum = useMemo(() => toMoneyNumber(proposedRate), [proposedRate]);
  const pinOk = useMemo(() => /^\d{6}$/.test(pin), [pin]);

  const validate = () => {
    setInlineError("");
    if (amountNum <= 0) return setInlineError("Enter a valid bid amount.");
    if (amountNum > available) return setInlineError(`Amount cannot exceed available (${available.toFixed(2)} ${listing.currency}).`);
    if (rateNum <= 0) return setInlineError("Enter a proposed rate in NGN.");
    if (rateNum >= listingRate) return setInlineError(`Proposed rate must be strictly lower than listing rate (${listingRate.toFixed(2)} NGN).`);
    if (!pinOk) return setInlineError("PIN must be exactly 6 digits.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (typeof v !== "undefined") return;

    setSubmitting(true);
    try {
      const payload = {
        sabit_id: String(listing.id),
        amount: amountNum.toFixed(2),
        proposed_rate_ngn: rateNum.toFixed(2),
        pin,
      };

      const res = await bidsApi.place(payload);
      if (!res.success) {
        const code = String((res.error as any)?.code || "");
        if (code === "PIN_NOT_SET") {
          toast.error("Transaction PIN is not set. Please set your PIN first.");
          onPinNotSet?.();
          return;
        }
        if (code === "INVALID_PIN") return setInlineError("Invalid PIN. Please try again.");
        if (code === "DUPLICATE_BID") return setInlineError("You already placed a similar bid for this listing.");
        if (code === "BID_RATE_TOO_HIGH") return setInlineError("Your proposed rate is too high for this listing.");
        return setInlineError(res.error?.message || "Failed to place bid.");
      }

      toast.success("Bid placed successfully.");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setInlineError(err?.message || "Failed to place bid.");
    } finally {
      setSubmitting(false);
    }
  };

  const listingRateText = `${listingRate.toFixed(2)} NGN`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sell-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <h2 className="modal-title" style={{ marginTop: 8 }}>
          Make Offer (Bid)
        </h2>
        <p className="modal-subtitle" style={{ marginBottom: 16 }}>
          Listing rate: <strong>{listingRateText}</strong> · Your bid rate must be lower.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="input-label">Amount ({listing.currency})</label>
            <input
              type="text"
              className="clean-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Up to ${available.toFixed(2)} ${listing.currency}`}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="input-label">Proposed rate (NGN)</label>
            <input
              type="text"
              className="clean-input"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              placeholder="Enter amount in NGN"
            />
          </div>

          <PinDotsInput value={pin} onChange={setPin} label="Transaction PIN" autoFocus />

          {inlineError && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 16,
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {inlineError}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button type="button" className="action-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-sabo" disabled={submitting}>
              {submitting ? "Placing..." : "Place Bid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal;

