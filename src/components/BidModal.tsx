import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import bidsApi from "../lib/api/bids.api";
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

const toMoneyNumber = (raw: string) =>
  Number(String(raw).replace(/[^0-9.]/g, "")) || 0;

const BidModal: React.FC<Props> = ({
  listing,
  onClose,
  onSuccess,
  onPinNotSet,
}) => {
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

  // Savings vs listing rate
  const savings =
    rateNum > 0 && amountNum > 0 ? (listingRate - rateNum) * amountNum : 0;
  const savingsPct =
    listingRate > 0 && rateNum > 0
      ? ((listingRate - rateNum) / listingRate) * 100
      : 0;
  const rateIsValid = rateNum > 0 && rateNum < listingRate;
  const fillPct = Math.min(
    100,
    available > 0 ? (amountNum / available) * 100 : 0,
  );
  const totalPayable =
    rateNum > 0 && amountNum > 0
      ? (amountNum * rateNum).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  const validate = () => {
    setInlineError("");
    if (amountNum <= 0) return setInlineError("Enter a valid bid amount.");
    if (amountNum > available)
      return setInlineError(
        `Amount cannot exceed available: ${available.toFixed(2)} ${listing.currency}.`,
      );
    if (rateNum <= 0) return setInlineError("Enter a proposed rate in NGN.");
    if (rateNum >= listingRate)
      return setInlineError(
        `Proposed rate must be lower than listing rate (${listingRate.toLocaleString()} NGN).`,
      );
    if (!pinOk) return setInlineError("PIN must be exactly 6 digits.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (typeof v !== "undefined") return;

    setSubmitting(true);
    try {
      const res = await bidsApi.place({
        sabit_id: String(listing.id),
        amount: amountNum.toFixed(2),
        proposed_rate_ngn: rateNum.toFixed(2),
        pin,
      });

      if (!res.success) {
        const code = String((res.error as any)?.code || "");
        if (code === "PIN_NOT_SET") {
          toast.error("Transaction PIN is not set. Please set your PIN first.");
          onPinNotSet?.();
          return;
        }
        if (code === "INVALID_PIN")
          return setInlineError("Invalid PIN. Please try again.");
        if (code === "DUPLICATE_BID")
          return setInlineError(
            "You already placed a similar bid for this listing.",
          );
        if (code === "BID_RATE_TOO_HIGH")
          return setInlineError(
            "Your proposed rate is too high for this listing.",
          );
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap');

        .bm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(8,18,17,0.72);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: bmFadeIn 0.2s ease;
        }
        @keyframes bmFadeIn { from { opacity: 0 } to { opacity: 1 } }

        .bm-card {
          font-family: 'DM Sans', sans-serif;
          width: 100%; max-width: 460px;
          background: #f5f9f8;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(8,18,17,0.4), 0 0 0 1px rgba(200,241,53,0.08);
          animation: bmSlideUp 0.28s cubic-bezier(0.34,1.26,0.64,1);
        }
        @keyframes bmSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }

        /* header */
        .bm-header {
          background: #0d1f1e;
          padding: 24px 24px 20px;
          position: relative; overflow: hidden;
        }
        .bm-header::before {
          content: '';
          position: absolute; top: -50px; right: -50px;
          width: 180px; height: 180px; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,241,53,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .bm-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 20px; margin-bottom: 12px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          background: rgba(251,191,36,0.12); color: #fbbf24;
          border: 1px solid rgba(251,191,36,0.25);
        }
        .bm-title {
          margin: 0 0 4px; font-size: 26px; font-weight: 800;
          color: #fff; letter-spacing: -0.6px; line-height: 1.1;
        }
        .bm-subtitle { margin: 0; font-size: 13px; color: #7a9c99; font-weight: 500; }
        .bm-subtitle strong { color: #b0ccc9; font-weight: 700; }
        .bm-close {
          position: absolute; top: 18px; right: 18px;
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #b0ccc9; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .bm-close:hover { background: rgba(200,241,53,0.15); color: #C8F135; border-color: rgba(200,241,53,0.3); }

        /* body */
        .bm-body { padding: 20px 22px 24px; display: flex; flex-direction: column; gap: 14px; }

        .bm-field-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #7a9c99; margin-bottom: 8px;
        }

        /* amount input */
        .bm-input-wrap { position: relative; }
        .bm-input-prefix {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          font-size: 15px; font-weight: 800; color: #0d1f1e;
          pointer-events: none; z-index: 1;
        }
        .bm-input {
          width: 100%; padding: 14px 16px 14px 52px;
          border-radius: 14px; border: 2px solid #e0ebe9;
          background: #fff; font-size: 20px; font-weight: 800;
          color: #0d1f1e; outline: none; font-family: inherit;
          letter-spacing: -0.4px; transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .bm-input:focus { border-color: #C8F135; }
        .bm-input::placeholder { color: #c0d5d2; font-weight: 600; font-size: 16px; }
        .bm-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .bm-input[type=number] { -moz-appearance: textfield; }

        /* fill bar */
        .bm-fill-track { height: 4px; border-radius: 4px; background: #e0ebe9; margin-top: 8px; overflow: hidden; }
        .bm-fill-bar { height: 100%; border-radius: 4px; background: linear-gradient(90deg,#C8F135,#a8d400); transition: width 0.3s cubic-bezier(0.4,0,0.2,1); }
        .bm-fill-hint { display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px; color: #7a9c99; font-weight: 600; }

        /* rate input panel */
        .bm-rate-panel {
          background: #fff; border: 2px solid #e0ebe9;
          border-radius: 16px; padding: 16px 18px;
          transition: border-color 0.2s;
        }
        .bm-rate-panel.valid   { border-color: #C8F135; background: rgba(200,241,53,0.03); }
        .bm-rate-panel.invalid { border-color: #fca5a5; background: rgba(254,226,226,0.3); }

        .bm-rate-status {
          margin-top: 8px; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; gap: 5px;
        }
        .bm-rate-status.good { color: #4a7a00; }
        .bm-rate-status.bad  { color: #b91c1c; }

        /* savings chip */
        .bm-savings {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-radius: 12px;
          background: rgba(200,241,53,0.1); border: 1px solid rgba(200,241,53,0.3);
        }
        .bm-savings-label { font-size: 12px; color: #4a7a00; font-weight: 700; }
        .bm-savings-value { font-size: 13px; font-weight: 800; color: #2d5a00; }

        /* summary */
        .bm-summary {
          background: #0d1f1e; border-radius: 16px; padding: 16px 18px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .bm-sum-row { display: flex; justify-content: space-between; align-items: center; }
        .bm-sum-label { font-size: 12px; color: #7a9c99; font-weight: 600; }
        .bm-sum-value { font-size: 13px; font-weight: 700; color: #b0ccc9; }
        .bm-sum-total { font-size: 22px; font-weight: 800; color: #C8F135; letter-spacing: -0.5px; }
        .bm-divider { height: 1px; background: rgba(255,255,255,0.06); }
        .bm-sum-note { font-size: 11px; color: #4a7a00; background: rgba(200,241,53,0.08); padding: 8px 10px; border-radius: 8px; font-weight: 600; }

        /* pin */
        .bm-pin-wrap { background: #fff; border: 1px solid #e0ebe9; border-radius: 16px; padding: 16px 18px; }

        /* error */
        .bm-error {
          padding: 11px 14px; border-radius: 12px;
          background: #fff1f1; border: 1px solid #fecaca;
          color: #991b1b; font-weight: 700; font-size: 13px;
          display: flex; align-items: flex-start; gap: 8px;
          animation: bmShake 0.3s ease;
        }
        @keyframes bmShake {
          0%,100% { transform: translateX(0) }
          25%      { transform: translateX(-4px) }
          75%      { transform: translateX(4px) }
        }

        /* buttons */
        .bm-actions { display: flex; gap: 10px; margin-top: 2px; }
        .bm-btn-cancel {
          flex: 1; padding: 14px; border-radius: 14px;
          border: 2px solid #e0ebe9; background: transparent;
          color: #3a6060; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .bm-btn-cancel:hover:not(:disabled) { border-color: #0d1f1e; color: #0d1f1e; background: rgba(13,31,30,0.04); }
        .bm-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
        .bm-btn-submit {
          flex: 2; padding: 14px; border-radius: 14px; border: none;
          background: #C8F135; color: #0d1f1e;
          font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
          transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: -0.2px;
        }
        .bm-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,241,53,0.3); }
        .bm-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        @keyframes bmSpin { to { transform: rotate(360deg) } }
        .bm-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2.5px solid rgba(13,31,30,0.25); border-top-color: #0d1f1e;
          animation: bmSpin 0.65s linear infinite;
        }
      `}</style>

      <div className="bm-overlay" onClick={onClose}>
        <div className="bm-card" onClick={(e) => e.stopPropagation()}>
          {/* HEADER */}
          <div className="bm-header">
            <button className="bm-close" onClick={onClose} aria-label="Close">
              ×
            </button>
            <div className="bm-badge">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4" />
              </svg>
              Bid / Offer
            </div>
            <h2 className="bm-title">Make an Offer</h2>
            <p className="bm-subtitle">
              Listing rate: <strong>{listingRate.toLocaleString()} NGN</strong>{" "}
              · Your bid must be lower
            </p>
          </div>

          {/* BODY */}
          <form onSubmit={handleSubmit}>
            <div className="bm-body">
              {/* Amount */}
              <div>
                <span className="bm-field-label">
                  Amount ({listing.currency})
                </span>
                <div className="bm-input-wrap">
                  <span className="bm-input-prefix">{listing.currency}</span>
                  <input
                    className="bm-input"
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`0.00`}
                    aria-label="Bid amount"
                  />
                </div>
                <div className="bm-fill-track">
                  <div
                    className="bm-fill-bar"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <div className="bm-fill-hint">
                  <span>
                    {amountNum > 0 ? amountNum.toFixed(2) : "0.00"}{" "}
                    {listing.currency}
                  </span>
                  <span>
                    Max {available.toFixed(2)} {listing.currency}
                  </span>
                </div>
              </div>

              {/* Proposed Rate */}
              <div>
                <span className="bm-field-label">Your proposed rate (NGN)</span>
                <div
                  className={`bm-rate-panel ${rateNum <= 0 ? "" : rateIsValid ? "valid" : "invalid"}`}
                >
                  <div className="bm-input-wrap">
                    <span className="bm-input-prefix">₦</span>
                    <input
                      className="bm-input"
                      type="number"
                      min="0"
                      step="any"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(e.target.value)}
                      placeholder={`Below ${listingRate.toLocaleString()}`}
                      aria-label="Proposed rate"
                      style={{
                        border: "none",
                        paddingLeft: 40,
                        background: "transparent",
                      }}
                    />
                  </div>
                  {rateNum > 0 && (
                    <div
                      className={`bm-rate-status ${rateIsValid ? "good" : "bad"}`}
                    >
                      {rateIsValid ? (
                        <>
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {savingsPct.toFixed(1)}% below listing rate
                        </>
                      ) : (
                        <>
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Must be below {listingRate.toLocaleString()} NGN
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Savings chip — only when both inputs are valid */}
              {rateIsValid && amountNum > 0 && savings > 0 && (
                <div className="bm-savings">
                  <span className="bm-savings-label">
                    💰 You save vs listing rate
                  </span>
                  <span className="bm-savings-value">
                    {savings.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    NGN
                  </span>
                </div>
              )}

              {/* Summary */}
              {totalPayable && (
                <div className="bm-summary">
                  <div className="bm-sum-row">
                    <span className="bm-sum-label">Your bid rate</span>
                    <span className="bm-sum-value">
                      {rateNum.toLocaleString()} NGN / {listing.currency}
                    </span>
                  </div>
                  <div className="bm-sum-row">
                    <span className="bm-sum-label">Amount</span>
                    <span className="bm-sum-value">
                      {amountNum.toFixed(2)} {listing.currency}
                    </span>
                  </div>
                  <div className="bm-divider" />
                  <div className="bm-sum-row">
                    <span className="bm-sum-label">Total if accepted</span>
                    <span className="bm-sum-total">{totalPayable} NGN</span>
                  </div>
                  <div className="bm-sum-note">
                    Funds are only deducted if the seller accepts your bid.
                  </div>
                </div>
              )}

              {/* PIN */}
              <div className="bm-pin-wrap">
                <PinDotsInput
                  value={pin}
                  onChange={setPin}
                  label="Transaction PIN"
                  autoFocus
                />
              </div>

              {/* Error */}
              {inlineError && (
                <div className="bm-error">
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
                  {inlineError}
                </div>
              )}

              {/* Actions */}
              <div className="bm-actions">
                <button
                  type="button"
                  className="bm-btn-cancel"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bm-btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="bm-spinner" /> Placing bid…
                    </>
                  ) : (
                    "Place Bid →"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BidModal;
