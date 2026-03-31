import React, { useEffect, useMemo, useState } from "react";
import { depositsApi } from "../lib/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface DepositModalProps {
  onClose: () => void;
  defaultCurrency?: "NGN" | "USD" | "GBP" | "CAD";
}

const CURRENCY_OPTIONS: Array<"NGN" | "USD" | "GBP" | "CAD"> = [
  "NGN",
  "USD",
  "GBP",
  "CAD",
];

type Currency = NonNullable<DepositModalProps["defaultCurrency"]>;

/* ─── inline styles ────────────────────────────────────────────────── */
const S = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(13,31,30,0.55)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  card: {
    background: "#f5f9f8",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 24px 64px rgba(13,31,30,0.18), 0 2px 8px rgba(13,31,30,0.08)",
    overflow: "hidden",
    position: "relative" as const,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    background: "#0d1f1e",
    padding: "28px 28px 24px",
    position: "relative" as const,
  },
  accentBar: {
    width: "36px",
    height: "4px",
    background: "#C8F135",
    borderRadius: "2px",
    marginBottom: "14px",
  },
  headerTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.5px",
    margin: 0,
    lineHeight: 1.2,
  },
  headerSubtitle: {
    fontSize: "13px",
    color: "#b0ccc9",
    marginTop: "6px",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  closeBtn: {
    position: "absolute" as const,
    top: "20px",
    right: "20px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid rgba(176,204,201,0.25)",
    background: "rgba(176,204,201,0.1)",
    color: "#b0ccc9",
    fontSize: "18px",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  body: {
    padding: "24px 28px 28px",
  },
  currencyTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "20px",
  },
  tabBtn: (active: boolean): React.CSSProperties => ({
    padding: "10px 4px",
    borderRadius: "10px",
    border: active ? "2px solid #C8F135" : "2px solid #dde8e6",
    background: active ? "#C8F135" : "#ffffff",
    color: active ? "#0d1f1e" : "#5a7a77",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
  }),
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#7a9c99",
    marginBottom: "8px",
  },
  inputWrap: {
    position: "relative" as const,
    marginBottom: "16px",
  },
  symbolBadge: {
    position: "absolute" as const,
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "15px",
    fontWeight: 800,
    color: "#0d1f1e",
    pointerEvents: "none" as const,
    zIndex: 1,
  },
  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "16px 16px 16px 36px",
    borderRadius: "12px",
    border: "2px solid #dde8e6",
    background: "#ffffff",
    fontSize: "20px",
    fontWeight: 800,
    color: "#0d1f1e",
    outline: "none",
    transition: "border-color 0.15s ease",
    fontFamily: "inherit",
    letterSpacing: "-0.3px",
  },
  fileWrap: {
    marginBottom: "16px",
  },
  fileBox: {
    border: "2px dashed #C8F135",
    borderRadius: "12px",
    padding: "20px",
    background: "rgba(200,241,53,0.05)",
    textAlign: "center" as const,
    cursor: "pointer",
    position: "relative" as const,
    overflow: "hidden",
  },
  fileInput: {
    position: "absolute" as const,
    inset: 0,
    opacity: 0,
    cursor: "pointer",
    width: "100%",
    height: "100%",
  },
  fileIconCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#C8F135",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
  },
  fileText: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0d1f1e",
  },
  fileSubtext: {
    fontSize: "11px",
    color: "#7a9c99",
    marginTop: "3px",
  },
  progressTrack: {
    height: "4px",
    background: "#dde8e6",
    borderRadius: "2px",
    marginTop: "10px",
    overflow: "hidden",
  },
  progressBar: (pct: number): React.CSSProperties => ({
    height: "100%",
    width: `${pct}%`,
    background: "#C8F135",
    borderRadius: "2px",
    transition: "width 0.2s ease",
  }),
  errorText: {
    fontSize: "12px",
    color: "#e05252",
    fontWeight: 600,
    marginTop: "-8px",
    marginBottom: "12px",
  },
  submitBtn: (disabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    background: disabled ? "#dde8e6" : "#C8F135",
    color: disabled ? "#9ab5b2" : "#0d1f1e",
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: "-0.2px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
    marginTop: "4px",
  }),
  // success state
  successCard: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  infoRow: {
    background: "#ffffff",
    border: "1px solid #e6efed",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase" as const,
    color: "#7a9c99",
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#0d1f1e",
    letterSpacing: "-0.2px",
  },
  payBtn: {
    display: "block",
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    background: "#C8F135",
    color: "#0d1f1e",
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: "-0.2px",
    textAlign: "center" as const,
    textDecoration: "none",
    marginTop: "4px",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  doneBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "2px solid #dde8e6",
    background: "transparent",
    color: "#5a7a77",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
};

const DepositModal: React.FC<DepositModalProps> = ({
  onClose,
  defaultCurrency = "NGN",
}) => {
  const navigate = useNavigate();

  const [currency, setCurrency] = useState<Currency>(
    defaultCurrency as Currency,
  );
  const [amount, setAmount] = useState<string>("");
  const [foreignFile, setForeignFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    setCurrency(defaultCurrency as Currency);
  }, [defaultCurrency]);

  const rawAmount = useMemo(() => {
    const v = parseFloat(amount.replace(/[^0-9.]/g, ""));
    return Number.isFinite(v) ? v : 0;
  }, [amount]);

  const getSymbol = (c: string) => {
    switch (c) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "GBP":
        return "£";
      case "CAD":
        return "CA$";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadPct(0);

    if (rawAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res =
        currency === "NGN"
          ? await depositsApi.ngnInitiate({ amount: rawAmount })
          : await (async () => {
              if (!foreignFile) {
                setError(
                  "Please upload proof of payment for foreign deposits.",
                );
                return null;
              }
              if (!foreignFile.type.startsWith("image/")) {
                setError("Proof of payment must be an image.");
                return null;
              }
              const formData = new FormData();
              formData.append("currency", String(currency));
              formData.append("amount", String(rawAmount));
              formData.append("proof", foreignFile);
              return depositsApi.foreign(formData, {
                onUploadProgress: (evt) => {
                  if (!evt.total) return;
                  const pct = Math.round((evt.loaded / evt.total) * 100);
                  setUploadPct(Math.max(0, Math.min(100, pct)));
                },
              });
            })();

      if (!res) return;

      if (!res.success) {
        toast.error(res.error?.message || "Failed to initiate deposit");
        setError(res.error?.message || "Failed to initiate deposit");
        return;
      }

      if (currency !== "NGN") {
        toast.success("Foreign deposit submitted. Pending admin review.");
        setSuccessData(null);
        setForeignFile(null);
        setUploadPct(0);
        onClose();
        navigate("/dashboard/deposit-pending?depositType=foreign");
        return;
      }

      setSuccessData(res.data);
      setForeignFile(null);
      setUploadPct(0);
      toast.success(
        "Deposit initiated. Complete payment to top up your wallet.",
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate deposit");
      setError(err?.message || "Failed to initiate deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentUrl = useMemo(() => {
    const d = successData || {};
    const url =
      d?.deposit?.payment_link ||
      d?.deposit?.payment_url ||
      d?.deposit?.url ||
      d?.paymentUrl ||
      d?.payment_url ||
      d?.url ||
      d?.payment_link ||
      d?.redirectUrl ||
      d?.redirect_url ||
      null;
    return url ? String(url) : null;
  }, [successData]);

  const depositRef = useMemo(() => {
    const d = successData || {};
    const ref =
      d?.reference || d?.ref || d?.id || d?.depositId || d?.paymentId || null;
    return ref ? String(ref) : null;
  }, [successData]);

  /* ── success screen ── */
  if (successData) {
    return (
      <div style={S.overlay} onClick={onClose}>
        <div style={S.card} onClick={(e) => e.stopPropagation()}>
          {/* header */}
          <div style={S.header}>
            <div style={S.accentBar} />
            <h2 style={S.headerTitle}>Deposit Initiated</h2>
            <p style={S.headerSubtitle}>
              Complete payment below to top up your wallet.
            </p>
            <button
              style={S.closeBtn}
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* body */}
          <div style={S.body}>
            <div style={S.successCard}>
              <div style={S.infoRow}>
                <span style={S.infoLabel}>Currency &amp; Amount</span>
                <span style={S.infoValue}>
                  {getSymbol(String(currency))}
                  {rawAmount.toLocaleString()} {currency}
                </span>
              </div>

              {depositRef && (
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Reference</span>
                  <span
                    style={{
                      ...S.infoValue,
                      fontSize: "13px",
                      fontFamily: "monospace",
                    }}
                  >
                    {depositRef}
                  </span>
                </div>
              )}

              {paymentUrl && (
                <a
                  style={S.payBtn}
                  href={paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Continue to Payment →
                </a>
              )}

              <button style={S.doneBtn} onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── main form ── */
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={S.header}>
          <div style={S.accentBar} />
          <h2 style={S.headerTitle}>Deposit Funds</h2>
          <p style={S.headerSubtitle}>
            Select a currency, enter your amount, and initiate a deposit.
          </p>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        {/* body */}
        <div style={S.body}>
          <form onSubmit={handleSubmit}>
            {/* currency tabs */}
            <label style={S.label}>Wallet Currency</label>
            <div style={S.currencyTabs}>
              {CURRENCY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  style={S.tabBtn(currency === c)}
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* amount input */}
            <label style={S.label}>Amount</label>
            <div style={S.inputWrap}>
              <span style={S.symbolBadge}>{getSymbol(String(currency))}</span>
              <input
                style={S.input}
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C8F135")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#dde8e6")}
              />
            </div>

            {error && <div style={S.errorText}>{error}</div>}

            {/* proof of payment */}
            {currency !== "NGN" && (
              <div style={S.fileWrap}>
                <label style={S.label}>Proof of Payment</label>
                <div style={S.fileBox}>
                  <input
                    style={S.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForeignFile(e.target.files?.[0] || null)
                    }
                  />
                  <div style={S.fileIconCircle}>
                    {/* upload icon */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0d1f1e"
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
                      <div style={S.fileText}>{foreignFile.name}</div>
                      <div style={S.fileSubtext}>
                        {(foreignFile.size / 1024).toFixed(1)} KB — tap to
                        change
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={S.fileText}>Upload proof of payment</div>
                      <div style={S.fileSubtext}>PNG, JPG, WEBP accepted</div>
                    </>
                  )}
                </div>

                {submitting && uploadPct > 0 && (
                  <div style={S.progressTrack}>
                    <div style={S.progressBar(uploadPct)} />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              style={S.submitBtn(
                submitting ||
                  rawAmount <= 0 ||
                  (currency !== "NGN" && !foreignFile),
              )}
              disabled={
                submitting ||
                rawAmount <= 0 ||
                (currency !== "NGN" && !foreignFile)
              }
            >
              {submitting ? "Initiating…" : "Initiate Deposit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
