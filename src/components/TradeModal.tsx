import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import tradesApi from "../lib/api/trades.api";
import PinDotsInput from "./PinDotsInput";

type Props = {
  listing: {
    id: number | string;
    rate: number;
    available: number;
    currency: string;
    type: "sell" | "buy";
  };
  onClose: () => void;
  onSuccess?: (tradeId: string) => void;
};

const toMoneyNumber = (raw: string) =>
  Number(String(raw).replace(/[^0-9.]/g, "")) || 0;

const TradeModal: React.FC<Props> = ({ listing, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>(String(listing.available));
  const [pin, setPin] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string>("");

  const available = listing.available || 0;
  const rate = listing.rate || 0;
  const amountNum = useMemo(() => toMoneyNumber(amount), [amount]);
  const pinOk = useMemo(() => /^\d{6}$/.test(pin), [pin]);
  const isBuying = listing.type === "sell";

  const totalPayable = (amountNum * rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const fillPct = Math.min(
    100,
    available > 0 ? (amountNum / available) * 100 : 0,
  );

  const validate = (): boolean => {
    setInlineError("");
    if (amountNum <= 0) { setInlineError("Enter a valid amount."); return false; }
    if (amountNum > available) { setInlineError(`Cannot exceed available: ${available.toFixed(2)} ${listing.currency}`); return false; }
    if (!pinOk) { setInlineError("PIN must be exactly 6 digits."); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        sabit_id: String(listing.id),
        amount: amountNum.toFixed(2),
        pin,
      };
      const res = await tradesApi.initiate(payload);
      if (!res.success) {
        const code = String((res.error as any)?.code || "");
        if (code === "PIN_NOT_SET") {
          toast.error("Transaction PIN is not set. Please set your PIN first.");
          navigate("/dashboard/transaction-pin");
          return;
        }
        if (code === "INVALID_PIN")
          return setInlineError("Invalid PIN. Please try again.");
        return setInlineError(
          res.error?.message || "Failed to initiate trade.",
        );
      }
      const tradeId = (res.data as any)?.id || (res.data as any)?.tradeId;
      toast.success("Trade initiated successfully.");
      onSuccess?.(String(tradeId));
      onClose();
      if (tradeId) navigate(`/dashboard/trade/${tradeId}`);
    } catch (err: any) {
      setInlineError(err?.message || "Failed to initiate trade.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

        .tm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(8, 18, 17, 0.72);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: tmFadeIn 0.2s ease;
        }
        @keyframes tmFadeIn { from { opacity: 0 } to { opacity: 1 } }

        .tm-card {
          font-family: 'DM Sans', sans-serif;
          width: 100%; max-width: 440px;
          background: #f5f9f8;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(8,18,17,0.4), 0 0 0 1px rgba(200,241,53,0.08);
          animation: tmSlideUp 0.28s cubic-bezier(0.34, 1.26, 0.64, 1);
        }
        @keyframes tmSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0)    scale(1) }
        }

        /* ── header ── */
        .tm-header {
          background: #0d1f1e;
          padding: 24px 24px 20px;
          position: relative;
          overflow: hidden;
        }
        .tm-header::before {
          content: '';
          position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,241,53,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .tm-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 12px;
        }
        .tm-badge.buy  { background: rgba(200,241,53,0.15); color: #C8F135; border: 1px solid rgba(200,241,53,0.3); }
        .tm-badge.sell { background: rgba(251,191,36,0.12);  color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }

        .tm-title {
          margin: 0 0 4px;
          font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.6px;
          line-height: 1.1;
        }
        .tm-rate-line {
          font-size: 13px; color: #7a9c99; font-weight: 500; margin: 0;
        }
        .tm-rate-line strong { color: #b0ccc9; font-weight: 700; }

        .tm-close {
          position: absolute; top: 18px; right: 18px;
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #b0ccc9; font-size: 18px; line-height: 1;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .tm-close:hover { background: rgba(200,241,53,0.15); color: #C8F135; border-color: rgba(200,241,53,0.3); }

        /* ── body ── */
        .tm-body { padding: 20px 22px 24px; display: flex; flex-direction: column; gap: 14px; }

        /* ── amount field ── */
        .tm-field-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #7a9c99; margin-bottom: 8px; display: block;
        }
        .tm-amount-wrap { position: relative; }
        .tm-amount-prefix {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 17px; font-weight: 800; color: #0d1f1e; pointer-events: none; z-index: 1;
        }
        .tm-amount-input {
          width: 100%; padding: 14px 16px 14px 55px;
          border-radius: 14px; border: 2px solid #e0ebe9;
          background: #fff; font-size: 22px; font-weight: 800;
          color: #0d1f1e; outline: none; font-family: inherit; letter-spacing: -0.5px;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .tm-amount-input:focus { border-color: #C8F135; }
        .tm-amount-input::placeholder { color: #c0d5d2; font-weight: 600; }
        .tm-amount-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .tm-amount-input[type=number] { -moz-appearance: textfield; }

        /* fill bar */
        .tm-fill-track {
          height: 4px; border-radius: 4px; background: #e0ebe9; margin-top: 8px; overflow: hidden;
        }
        .tm-fill-bar {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #C8F135, #a8d400);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .tm-fill-hint {
          display: flex; justify-content: space-between; margin-top: 5px;
          font-size: 11px; color: #7a9c99; font-weight: 600;
        }

        /* ── summary card ── */
        .tm-summary {
          background: #0d1f1e; border-radius: 16px; padding: 16px 18px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .tm-summary-row {
          display: flex; justify-content: space-between; align-items: center;
        }
        .tm-summary-label { font-size: 12px; color: #7a9c99; font-weight: 600; }
        .tm-summary-value { font-size: 13px; font-weight: 700; color: #b0ccc9; }
        .tm-summary-total { font-size: 22px; font-weight: 800; color: #C8F135; letter-spacing: -0.5px; }
        .tm-divider { height: 1px; background: rgba(255,255,255,0.06); }
        .tm-note { font-size: 11px; color: #4a7a00; background: rgba(200,241,53,0.08); padding: 8px 10px; border-radius: 8px; font-weight: 600; }

        /* ── pin section ── */
        .tm-pin-wrap { background: #fff; border: 1px solid #e0ebe9; border-radius: 16px; padding: 16px 18px; }

        /* ── error ── */
        .tm-error {
          padding: 11px 14px; border-radius: 12px;
          background: #fff1f1; border: 1px solid #fecaca;
          color: #991b1b; font-weight: 700; font-size: 13px;
          display: flex; align-items: flex-start; gap: 8px;
          animation: tmShake 0.3s ease;
        }
        @keyframes tmShake {
          0%,100% { transform: translateX(0) }
          25%      { transform: translateX(-4px) }
          75%      { transform: translateX(4px) }
        }

        /* ── buttons ── */
        .tm-actions { display: flex; gap: 10px; margin-top: 2px; }
        .tm-btn-cancel {
          flex: 1; padding: 14px; border-radius: 14px;
          border: 2px solid #e0ebe9; background: transparent;
          color: #3a6060; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .tm-btn-cancel:hover:not(:disabled) { border-color: #0d1f1e; color: #0d1f1e; background: rgba(13,31,30,0.04); }
        .tm-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }

        .tm-btn-submit {
          flex: 2; padding: 14px; border-radius: 14px; border: none;
          font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
          transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: -0.2px;
        }
        .tm-btn-submit.buy-btn  { background: #C8F135; color: #0d1f1e; }
        .tm-btn-submit.sell-btn { background: #0d1f1e; color: #C8F135; }
        .tm-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,31,30,0.18); }
        .tm-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        @keyframes tmSpin { to { transform: rotate(360deg) } }
        .tm-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2.5px solid rgba(13,31,30,0.25); border-top-color: #0d1f1e;
          animation: tmSpin 0.65s linear infinite;
        }
        .tm-btn-submit.sell-btn .tm-spinner { border-color: rgba(200,241,53,0.25); border-top-color: #C8F135; }
      `}</style>

      <div className="tm-overlay" onClick={onClose}>
        <div className="tm-card" onClick={(e) => e.stopPropagation()}>
          {/* ── HEADER ── */}
          <div className="tm-header">
            <button className="tm-close" onClick={onClose} aria-label="Close">
              ×
            </button>

            <div className={`tm-badge ${isBuying ? "buy" : "sell"}`}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4" />
              </svg>
              {isBuying ? "Buy order" : "Sell order"}
            </div>

            <h2 className="tm-title">
              {isBuying ? "Buy" : "Sell"} {listing.currency}
            </h2>
            <p className="tm-rate-line">
              Rate: <strong>{rate.toLocaleString()} NGN</strong> /{" "}
              {listing.currency}
            </p>
          </div>

          {/* ── BODY ── */}
          <form onSubmit={handleSubmit}>
            <div className="tm-body">
              {/* Amount */}
              <div>
                <span className="tm-field-label">
                  Amount to {isBuying ? "buy" : "sell"} ({listing.currency})
                </span>
                <div className="tm-amount-wrap">
                  <span className="tm-amount-prefix">
                    {listing.currency === "NGN" ? "₦" : listing.currency}
                  </span>
                  <input
                    className="tm-amount-input"
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`0.00`}
                    aria-label="Trade amount"
                  />
                </div>
                <div className="tm-fill-track">
                  <div
                    className="tm-fill-bar"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <div className="tm-fill-hint">
                  <span>
                    {amountNum > 0 ? amountNum.toFixed(2) : "0.00"}{" "}
                    {listing.currency}
                  </span>
                  <span>
                    Max {available.toFixed(2)} {listing.currency}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="tm-summary">
                <div className="tm-summary-row">
                  <span className="tm-summary-label">Rate</span>
                  <span className="tm-summary-value">
                    {rate.toLocaleString()} NGN / {listing.currency}
                  </span>
                </div>
                <div className="tm-summary-row">
                  <span className="tm-summary-label">Amount</span>
                  <span className="tm-summary-value">
                    {amountNum > 0 ? amountNum.toFixed(2) : "—"}{" "}
                    {listing.currency}
                  </span>
                </div>
                <div className="tm-divider" />
                <div className="tm-summary-row">
                  <span className="tm-summary-label">
                    {isBuying ? "Total Payable" : "Total Receivable"}
                  </span>
                  <span className="tm-summary-total">{totalPayable} NGN</span>
                </div>
                <div className="tm-note">
                  {isBuying
                    ? "Funds will be deducted from your NGN wallet."
                    : `Funds will be deducted from your ${listing.currency} wallet.`}
                </div>
              </div>

              {/* PIN */}
              <div className="tm-pin-wrap">
                <PinDotsInput
                  value={pin}
                  onChange={setPin}
                  label="Transaction PIN"
                  autoFocus
                />
              </div>

              {/* Error */}
              {inlineError && (
                <div className="tm-error">
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
              <div className="tm-actions">
                <button
                  type="button"
                  className="tm-btn-cancel"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`tm-btn-submit ${isBuying ? "buy-btn" : "sell-btn"}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="tm-spinner" /> Processing…
                    </>
                  ) : (
                    `Confirm ${isBuying ? "Buy" : "Sell"} →`
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

export default TradeModal;
