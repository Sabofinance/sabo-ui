import React, { useMemo, useState } from "react";
import { depositsApi } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const COLORS = {
  lime: "#C8F135",
  dark: "#0d1f1e",
  bg: "#f5f9f8",
  surface: "#ffffff",
  border: "#e0ebe9",
  textMain: "#0d1f1e",
  textMuted: "#7a9c99",
  textLight: "#b0ccc9",
  errorRed: "#e05252",
};

const CURRENCY_META: Record<
  string,
  { symbol: string; label: string; flag: string }
> = {
  GBP: { symbol: "£", label: "British Pound", flag: "🇬🇧" },
  USD: { symbol: "$", label: "US Dollar", flag: "🇺🇸" },
  CAD: { symbol: "CA$", label: "Canadian Dollar", flag: "🇨🇦" },
};

const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"ngn" | "foreign">("ngn");
  const [ngnAmount, setNgnAmount] = useState("");
  const [foreignAmount, setForeignAmount] = useState("");
  const [foreignCurrency, setForeignCurrency] = useState<"GBP" | "USD" | "CAD">(
    "GBP",
  );
  const [foreignFile, setForeignFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadPct, setUploadPct] = useState<number>(0);

  const ngnRaw = useMemo(
    () => Number(String(ngnAmount).replace(/[^0-9.]/g, "")) || 0,
    [ngnAmount],
  );
  const foreignRaw = useMemo(
    () => Number(String(foreignAmount).replace(/[^0-9.]/g, "")) || 0,
    [foreignAmount],
  );

  const handleNgnDeposit = async () => {
    setLoading(true);
    setMessage("");
    const res = await depositsApi.ngnInitiate({ amount: String(ngnRaw) });
    setLoading(false);
    if (res.success) {
      const d: any = res.data || {};
      const paymentUrl =
        d?.deposit?.payment_link ||
        d?.deposit?.payment_url ||
        d?.deposit?.url ||
        d?.paymentUrl ||
        d?.payment_url ||
        d?.payment_link ||
        d?.url ||
        null;
      if (paymentUrl) {
        window.location.href = String(paymentUrl);
        return;
      }
      navigate("/dashboard/deposit-pending");
      setNgnAmount("");
    } else {
      setMessage(res.error?.message || "Failed to initiate NGN deposit.");
    }
  };

  const handleForeignDeposit = async () => {
    if (!foreignFile) {
      setMessage("Please upload a file.");
      return;
    }
    if (!foreignFile.type.startsWith("image/")) {
      setMessage("Proof of payment must be an image.");
      return;
    }
    setLoading(true);
    setMessage("");
    setUploadPct(0);
    const formData = new FormData();
    formData.append("currency", foreignCurrency);
    formData.append("amount", String(foreignRaw));
    formData.append("proof", foreignFile);
    const res = await depositsApi.foreign(formData, {
      onUploadProgress: (evt) => {
        if (!evt.total) return;
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setUploadPct(Math.max(0, Math.min(100, pct)));
      },
    });
    setLoading(false);
    if (res.success) {
      setForeignAmount("");
      setForeignFile(null);
      setUploadPct(0);
      navigate("/dashboard/deposit-pending?depositType=foreign");
      return;
    } else {
      setMessage(res.error?.message || "Failed to submit foreign deposit.");
    }
  };

  const isNgnDisabled = loading || ngnRaw <= 0;
  const isForeignDisabled = loading || foreignRaw <= 0 || !foreignFile;
  const isSuccess = message.toLowerCase().includes("success");
  const meta = CURRENCY_META[foreignCurrency];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .dep-page * { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimBar {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .dep-page {
          min-height: 100vh;
          background: ${COLORS.bg};
          padding: 36px 32px;
        }

        /* ── header ── */
        .dep-page-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
          animation: fadeUp 0.35s ease both;
        }
        .dep-page-header-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: ${COLORS.dark};
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dep-page-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: ${COLORS.textMuted}; margin-bottom: 4px;
        }
        .dep-page-title {
          font-size: 26px; font-weight: 800; color: ${COLORS.textMain};
          letter-spacing: -0.5px; margin: 0; line-height: 1.15;
        }

        /* ── tab switcher ── */
        .dep-tabs {
          display: inline-flex;
          background: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
          border-radius: 14px;
          padding: 5px;
          gap: 4px;
          margin-bottom: 28px;
          animation: fadeUp 0.4s ease 0.05s both;
        }
        .dep-tab-btn {
          padding: 10px 22px;
          border-radius: 10px;
          border: none;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          display: flex; align-items: center; gap: 8px;
        }
        .dep-tab-btn.active {
          background: ${COLORS.dark};
          color: ${COLORS.lime};
        }
        .dep-tab-btn.inactive {
          background: transparent;
          color: ${COLORS.textMuted};
        }
        .dep-tab-btn.inactive:hover {
          background: ${COLORS.bg};
          color: ${COLORS.textMain};
        }

        /* ── card ── */
        .dep-card {
          background: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
          border-radius: 20px;
          overflow: hidden;
          max-width: 480px;
          box-shadow: 0 4px 20px rgba(13,31,30,0.06);
          animation: fadeUp 0.45s ease 0.1s both;
        }
        .dep-card-header {
          background: ${COLORS.dark};
          padding: 22px 26px;
          display: flex; align-items: center; gap: 12px;
        }
        .dep-card-header-accent {
          width: 4px; height: 32px;
          background: ${COLORS.lime};
          border-radius: 2px; flex-shrink: 0;
        }
        .dep-card-header-title {
          font-size: 16px; font-weight: 800;
          color: #fff; letter-spacing: -0.3px; margin: 0;
        }
        .dep-card-header-sub {
          font-size: 12px; color: ${COLORS.textLight};
          margin: 3px 0 0; font-weight: 500;
        }
        .dep-card-body { padding: 26px; }

        /* ── form fields ── */
        .dep-field { margin-bottom: 18px; }
        .dep-label {
          display: block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: ${COLORS.textMuted}; margin-bottom: 8px;
        }
        .dep-input-wrap { position: relative; }
        .dep-input-prefix {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 16px; font-weight: 800;
          color: ${COLORS.textMain}; pointer-events: none; z-index: 1;
        }
        .dep-input {
          width: 100%;
          padding: 15px 15px 15px 36px;
          border-radius: 12px;
          border: 2px solid ${COLORS.border};
          background: ${COLORS.bg};
          font-size: 20px; font-weight: 800;
          color: ${COLORS.textMain};
          outline: none;
          transition: border-color 0.15s ease;
          font-family: inherit; letter-spacing: -0.3px;
        }
        .dep-input:focus { border-color: ${COLORS.lime}; }
        .dep-input::placeholder { color: ${COLORS.textLight}; font-weight: 500; }

        /* currency selector */
        .dep-currency-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .dep-currency-opt {
          padding: 12px 8px;
          border-radius: 12px;
          border: 2px solid ${COLORS.border};
          background: ${COLORS.bg};
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
          font-family: inherit;
        }
        .dep-currency-opt.selected {
          border-color: ${COLORS.lime};
          background: rgba(200,241,53,0.08);
        }
        .dep-currency-opt:hover:not(.selected) {
          border-color: ${COLORS.textLight};
        }
        .dep-currency-flag { font-size: 20px; display: block; margin-bottom: 4px; }
        .dep-currency-code { font-size: 13px; font-weight: 800; color: ${COLORS.textMain}; }
        .dep-currency-name { font-size: 10px; color: ${COLORS.textMuted}; font-weight: 500; margin-top: 2px; }

        /* file zone */
        .dep-file-zone {
          border: 2px dashed ${COLORS.lime};
          border-radius: 12px;
          padding: 22px 16px;
          background: rgba(200,241,53,0.04);
          text-align: center;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: background 0.15s ease;
        }
        .dep-file-zone:hover { background: rgba(200,241,53,0.08); }
        .dep-file-zone input[type="file"] {
          position: absolute; inset: 0; opacity: 0; cursor: pointer;
          width: 100%; height: 100%;
        }
        .dep-file-icon-circle {
          width: 42px; height: 42px; border-radius: 50%;
          background: ${COLORS.lime};
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 10px;
        }
        .dep-file-label { font-size: 13px; font-weight: 700; color: ${COLORS.textMain}; }
        .dep-file-sub   { font-size: 11px; color: ${COLORS.textMuted}; margin-top: 3px; }

        /* progress */
        .dep-progress-track {
          height: 4px; background: ${COLORS.border}; border-radius: 2px;
          margin-top: 10px; overflow: hidden;
        }
        .dep-progress-fill {
          height: 100%; border-radius: 2px;
          background: ${COLORS.lime};
          transition: width 0.2s ease;
        }
        .dep-progress-label {
          font-size: 11px; font-weight: 700;
          color: ${COLORS.textMuted}; margin-top: 6px;
        }

        /* submit button */
        .dep-submit-btn {
          width: 100%; padding: 16px;
          border-radius: 13px; border: none;
          font-size: 15px; font-weight: 800;
          letter-spacing: -0.2px;
          cursor: pointer; transition: all 0.15s ease;
          font-family: inherit; margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .dep-submit-btn.enabled {
          background: ${COLORS.lime}; color: ${COLORS.dark};
        }
        .dep-submit-btn.enabled:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(200,241,53,0.35);
        }
        .dep-submit-btn.enabled:active { transform: translateY(0); }
        .dep-submit-btn.disabled {
          background: #e0ebe9; color: ${COLORS.textMuted}; cursor: not-allowed;
        }

        /* notification */
        .dep-notification {
          max-width: 480px;
          margin-top: 16px;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 13px; font-weight: 600;
          display: flex; align-items: flex-start; gap: 10px;
          animation: fadeUp 0.25s ease both;
        }
        .dep-notification.success {
          background: rgba(200,241,53,0.12);
          border: 1px solid rgba(200,241,53,0.4);
          color: #3a6200;
        }
        .dep-notification.error {
          background: rgba(224,82,82,0.08);
          border: 1px solid rgba(224,82,82,0.3);
          color: ${COLORS.errorRed};
        }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .dep-spinner {
          width: 16px; height: 16px;
          border: 2.5px solid rgba(13,31,30,0.2);
          border-top-color: ${COLORS.dark};
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .dep-page { padding: 20px 16px; }
        }
      `}</style>

      <main className="dep-page">
        {/* header */}
        <div className="dep-page-header">
          <div className="dep-page-header-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.lime}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="dep-page-eyebrow">Finance</div>
            <h1 className="dep-page-title">Deposit Funds</h1>
          </div>
        </div>

        {/* tab switcher */}
        <div className="dep-tabs">
          <button
            className={`dep-tab-btn ${tab === "ngn" ? "active" : "inactive"}`}
            onClick={() => {
              setTab("ngn");
              setMessage("");
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9 8h6l-2 4h2l-6 4 2-4H9z" />
            </svg>
            NGN Deposit
          </button>
          <button
            className={`dep-tab-btn ${tab === "foreign" ? "active" : "inactive"}`}
            onClick={() => {
              setTab("foreign");
              setMessage("");
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
            </svg>
            Foreign Deposit
          </button>
        </div>

        {/* ── NGN card ── */}
        {tab === "ngn" && (
          <div className="dep-card">
            <div className="dep-card-header">
              <div className="dep-card-header-accent" />
              <div>
                <p className="dep-card-header-title">Nigerian Naira Deposit</p>
                <p className="dep-card-header-sub">
                  You'll be redirected to complete payment via Flutterwave
                </p>
              </div>
            </div>
            <div className="dep-card-body">
              <div className="dep-field">
                <label className="dep-label">Amount</label>
                <div className="dep-input-wrap">
                  <span className="dep-input-prefix">₦</span>
                  <input
                    className="dep-input"
                    value={ngnAmount}
                    onChange={(e) => setNgnAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button
                className={`dep-submit-btn ${isNgnDisabled ? "disabled" : "enabled"}`}
                onClick={handleNgnDeposit}
                disabled={isNgnDisabled}
              >
                {loading ? (
                  <>
                    <span className="dep-spinner" /> Processing…
                  </>
                ) : (
                  <>Proceed to Payment →</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Foreign card ── */}
        {tab === "foreign" && (
          <div className="dep-card">
            <div className="dep-card-header">
              <div className="dep-card-header-accent" />
              <div>
                <p className="dep-card-header-title">
                  Foreign Currency Deposit
                </p>
                <p className="dep-card-header-sub">
                  Submit proof of payment for admin review
                </p>
              </div>
            </div>
            <div className="dep-card-body">
              {/* currency picker */}
              <div className="dep-field">
                <label className="dep-label">Select Currency</label>
                <div className="dep-currency-grid">
                  {(["GBP", "USD", "CAD"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`dep-currency-opt ${foreignCurrency === c ? "selected" : ""}`}
                      onClick={() => setForeignCurrency(c)}
                    >
                      <span className="dep-currency-flag">
                        {CURRENCY_META[c].flag}
                      </span>
                      <div className="dep-currency-code">{c}</div>
                      <div className="dep-currency-name">
                        {CURRENCY_META[c].label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* amount */}
              <div className="dep-field">
                <label className="dep-label">Amount</label>
                <div className="dep-input-wrap">
                  <span className="dep-input-prefix">{meta.symbol}</span>
                  <input
                    className="dep-input"
                    value={foreignAmount}
                    onChange={(e) => setForeignAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* file upload */}
              <div className="dep-field">
                <label className="dep-label">Proof of Payment</label>
                <div className="dep-file-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForeignFile(e.target.files?.[0] || null)
                    }
                  />
                  <div className="dep-file-icon-circle">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={COLORS.dark}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  {foreignFile ? (
                    <>
                      <div className="dep-file-label">{foreignFile.name}</div>
                      <div className="dep-file-sub">
                        {(foreignFile.size / 1024).toFixed(1)} KB — tap to
                        change
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="dep-file-label">
                        Upload proof of payment
                      </div>
                      <div className="dep-file-sub">
                        PNG, JPG or WEBP accepted
                      </div>
                    </>
                  )}
                </div>

                {loading && uploadPct > 0 && (
                  <>
                    <div className="dep-progress-track">
                      <div
                        className="dep-progress-fill"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                    <div className="dep-progress-label">
                      Uploading proof: {uploadPct}%
                    </div>
                  </>
                )}
              </div>

              <button
                className={`dep-submit-btn ${isForeignDisabled ? "disabled" : "enabled"}`}
                onClick={handleForeignDeposit}
                disabled={isForeignDisabled}
              >
                {loading ? (
                  <>
                    <span className="dep-spinner" /> Processing…
                  </>
                ) : (
                  <>Submit for Review →</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* notification */}
        {message && (
          <div
            className={`dep-notification ${isSuccess ? "success" : "error"}`}
          >
            {isSuccess ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {message}
          </div>
        )}
      </main>
    </>
  );
};

export default DepositPage;
