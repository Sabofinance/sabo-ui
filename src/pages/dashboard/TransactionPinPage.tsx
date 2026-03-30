import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/SettingsPage.css";
import { useAuth } from "../../context/AuthContext";
import { accountApi } from "../../lib/api/account.api";

const PIN_REGEX = /^\d{6}$/;

const TransactionPinPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string>("");

  const pinValid = useMemo(() => PIN_REGEX.test(pin), [pin]);
  const confirmValid = useMemo(() => PIN_REGEX.test(confirmPin), [confirmPin]);
  const pinsMatch = useMemo(() => pinValid && confirmValid && pin === confirmPin, [pin, confirmPin, pinValid, confirmValid]);

  const currentPinSet = Boolean(user?.transaction_pin_set);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError("");

    if (!pinValid || !confirmValid) {
      setInlineError("PIN must be exactly 6 digits.");
      return;
    }
    if (!pinsMatch) {
      setInlineError("PINs do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await accountApi.setTransactionPin(pin, confirmPin);
      toast.success("Transaction PIN set successfully.");
      await refreshUser();
      navigate("/dashboard");
    } catch (err: any) {
      const code = String(err?.code || err?.response?.data?.error?.code || "");
      if (code === "PIN_ALREADY_SET") {
        setInlineError("A transaction PIN is already set on your account.");
        return;
      }
      setInlineError(err?.message || "Failed to set PIN. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <main className="settings-page">
        <div className="page-header">
          <h1 className="page-title">Transaction PIN</h1>
          <p className="page-subtitle">
            {currentPinSet ? "Update your transaction PIN" : "Set up your transaction PIN to continue"}
          </p>
        </div>

        <div className="settings-card">
          {!currentPinSet && (
            <div style={{ marginBottom: 22, padding: "12px 14px", borderRadius: 16, background: "#fff7e6", border: "1px solid #fde68a" }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>PIN Required</div>
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                You can’t place bids or initiate trades until your transaction PIN is set.
              </div>
            </div>
          )}

          <h3 className="settings-card-title" style={{ marginBottom: 18 }}>
            Set / Update PIN
          </h3>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="pin">PIN (6 digits)</label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPin(digits);
                }}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                placeholder="••••••"
              />
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {pin && !pinValid ? "PIN must be exactly 6 digits." : " "}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_pin">Confirm PIN (6 digits)</label>
              <input
                id="confirm_pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={confirmPin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setConfirmPin(digits);
                }}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                placeholder="••••••"
              />
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {confirmPin && !confirmValid ? "Confirm PIN must be exactly 6 digits." : " "}
              </div>
            </div>

            {inlineError && (
              <div style={{ marginTop: 10, marginBottom: 10, padding: "10px 12px", borderRadius: 16, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 600 }}>
                {inlineError}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={submitting || !pinValid || !confirmValid || !pinsMatch}>
              {submitting ? "Setting PIN..." : "Set Transaction PIN"}
            </button>

            <button
              type="button"
              className="action-btn"
              style={{ marginTop: 14 }}
              onClick={() => navigate("/dashboard")}
              disabled={submitting}
            >
              Back to dashboard
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TransactionPinPage;

