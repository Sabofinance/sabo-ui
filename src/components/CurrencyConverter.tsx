import React, { useState, useRef, useEffect, useMemo } from "react";
import { conversionsApi } from "../lib/api";
import { toast } from "react-toastify";

/* ─── types ────────────────────────────────────────────────────────── */
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "https://flagcdn.com/w40/gb.png",
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "https://flagcdn.com/w40/us.png",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "CA$",
    flag: "https://flagcdn.com/w40/ca.png",
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    flag: "https://flagcdn.com/w40/ng.png",
  },
];

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/* ─── dropdown ─────────────────────────────────────────────────────── */
interface DropdownProps {
  selected: Currency;
  onSelect: (c: Currency) => void;
  exclude: string;
}

const CurrencyDropdown: React.FC<DropdownProps> = ({
  selected,
  onSelect,
  exclude,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Select currency"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 12,
          border: `2px solid ${open ? "#C8F135" : "#e0ebe9"}`,
          background: "#f5f9f8",
          cursor: "pointer",
          transition: "border-color 0.15s ease",
          fontFamily: "inherit",
        }}
      >
        <img
          src={selected.flag}
          alt={selected.code}
          style={{ width: 22, height: 16, borderRadius: 3, objectFit: "cover" }}
        />
        <span
          style={{
            fontWeight: 800,
            fontSize: 14,
            color: "#0d1f1e",
            letterSpacing: "0.02em",
          }}
        >
          {selected.code}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a9c99"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            background: "#fff",
            border: "1px solid #e0ebe9",
            borderRadius: 14,
            boxShadow: "0 8px 28px rgba(13,31,30,0.12)",
            overflow: "hidden",
            minWidth: 180,
          }}
        >
          {CURRENCIES.filter((c) => c.code !== exclude).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onSelect(c);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                border: "none",
                background:
                  c.code === selected.code
                    ? "rgba(200,241,53,0.1)"
                    : "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                borderBottom: "1px solid #f0f7f6",
              }}
            >
              <img
                src={c.flag}
                alt={c.code}
                style={{
                  width: 22,
                  height: 16,
                  borderRadius: 3,
                  objectFit: "cover",
                }}
              />
              <span style={{ fontWeight: 800, fontSize: 13, color: "#0d1f1e" }}>
                {c.code}
              </span>
              <span style={{ fontSize: 12, color: "#7a9c99", fontWeight: 500 }}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── main converter ───────────────────────────────────────────────── */
interface CurrencyConverterProps {
  onSuccess?: () => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onSuccess }) => {
  const [rawAmount, setRawAmount] = useState("30");
  const [rawRate, setRawRate] = useState(""); // manual rate input
  const [rawFee, setRawFee] = useState(""); // manual fee input
  const [sendCurrency, setSendCurrency] = useState<Currency>(CURRENCIES[0]); // GBP
  const [recvCurrency, setRecvCurrency] = useState<Currency>(CURRENCIES[3]); // NGN
  const [executing, setExecuting] = useState(false);

  const amount = Math.max(0, parseFloat(rawAmount) || 0);
  const manualRate = Math.max(0, parseFloat(rawRate) || 0);
  const feeAmount = Math.max(0, parseFloat(rawFee) || 0);

  // Derived locally — no API call
  const receivedAmount = useMemo(() => {
    if (sendCurrency.code === recvCurrency.code) return amount;
    if (amount <= 0 || manualRate <= 0) return null;
    return amount * manualRate;
  }, [amount, manualRate, sendCurrency.code, recvCurrency.code]);

  const totalAmount = amount + feeAmount;

  const handleSwap = () => {
    setSendCurrency(recvCurrency);
    setRecvCurrency(sendCurrency);
    setRawRate("");
  };

  const handleSendChange = (c: Currency) => {
    setSendCurrency(c);
    if (c.code === recvCurrency.code) setRecvCurrency(sendCurrency);
    setRawRate("");
  };

  const handleRecvChange = (c: Currency) => {
    setRecvCurrency(c);
    if (c.code === sendCurrency.code) setSendCurrency(recvCurrency);
    setRawRate("");
  };

  const canExecute =
    !executing && amount > 0 && receivedAmount !== null && receivedAmount > 0;

  const handleExecute = async () => {
    if (!canExecute) return;
    setExecuting(true);
    try {
      const res = await conversionsApi.execute({
        from: sendCurrency.code,
        to: recvCurrency.code,
        amount,
      });
      if (res.success) {
        toast.success("Conversion successful!");
        setRawAmount("");
        setRawRate("");
        setRawFee("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error?.message || "Conversion failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setExecuting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "2px solid #e0ebe9",
    background: "#f5f9f8",
    fontSize: 20,
    fontWeight: 800,
    color: "#0d1f1e",
    outline: "none",
    fontFamily: "inherit",
    letterSpacing: "-0.3px",
    transition: "border-color 0.15s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#7a9c99",
    marginBottom: 8,
  };

  const panelStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e0ebe9",
    borderRadius: 16,
    padding: "18px 18px 16px",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .cc-wrap * { font-family: 'DM Sans', -apple-system, sans-serif; box-sizing: border-box; }
        .cc-wrap input:focus { border-color: #C8F135 !important; }
        .cc-wrap input[type=number]::-webkit-inner-spin-button,
        .cc-wrap input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .cc-wrap input[type=number] { -moz-appearance: textfield; }

        @keyframes ccSpin { to { transform: rotate(360deg); } }
        .cc-spinner {
          width: 16px; height: 16px;
          border: 2.5px solid rgba(13,31,30,0.2);
          border-top-color: #0d1f1e; border-radius: 50%;
          animation: ccSpin 0.7s linear infinite; display: inline-block;
        }
      `}</style>

      <div
        className="cc-wrap"
        style={{
          background: "#f5f9f8",
          border: "1px solid #e0ebe9",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(13,31,30,0.07)",
        }}
      >
        {/* dark header */}
        <div
          style={{
            background: "#0d1f1e",
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 4,
              height: 32,
              background: "#C8F135",
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.3px",
              }}
            >
              Currency Conversion
            </p>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 12,
                color: "#b0ccc9",
                fontWeight: 500,
              }}
            >
              Enter the exchange rate manually to calculate
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "22px 22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* YOU'RE SENDING */}
          <div style={panelStyle}>
            <span style={labelStyle}>You're sending</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#0d1f1e",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                >
                  {sendCurrency.symbol}
                </span>
                <input
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  type="number"
                  min="0"
                  step="any"
                  value={rawAmount}
                  onChange={(e) => setRawAmount(e.target.value)}
                  placeholder="0.00"
                  aria-label="Amount to send"
                />
              </div>
              <CurrencyDropdown
                selected={sendCurrency}
                onSelect={handleSendChange}
                exclude={recvCurrency.code}
              />
            </div>
          </div>

          {/* SWAP */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "#e0ebe9" }} />
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap currencies"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#0d1f1e",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "rotate(180deg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "rotate(0deg)")
              }
            >
              <img src="/gemini-svg.svg" alt="" width={20}/>
            </button>
            <div style={{ flex: 1, height: 1, background: "#e0ebe9" }} />
          </div>

          {/* MANUAL RATE INPUT */}
          <div
            style={{
              ...panelStyle,
              border: "2px solid #C8F135",
              background: "rgba(200,241,53,0.04)",
            }}
          >
            <span style={labelStyle}>
              Exchange rate — {sendCurrency.symbol}1 {sendCurrency.code} =
            </span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#0d1f1e",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                >
                  {recvCurrency.symbol}
                </span>
                <input
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  type="number"
                  min="0"
                  step="any"
                  value={rawRate}
                  onChange={(e) => setRawRate(e.target.value)}
                  placeholder="Enter rate e.g. 2050"
                  aria-label="Exchange rate"
                />
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#f5f9f8",
                  border: "2px solid #e0ebe9",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <img
                  src={recvCurrency.flag}
                  alt={recvCurrency.code}
                  style={{
                    width: 22,
                    height: 16,
                    borderRadius: 3,
                    objectFit: "cover",
                  }}
                />
                <span
                  style={{ fontWeight: 800, fontSize: 14, color: "#0d1f1e" }}
                >
                  {recvCurrency.code}
                </span>
              </div>
            </div>
            {rawRate && manualRate > 0 && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#4a7a00",
                  fontWeight: 600,
                }}
              >
                ✓ Rate set: {sendCurrency.symbol}1 = {recvCurrency.symbol}
                {fmt(manualRate)}
              </div>
            )}
          </div>

          {/* RECIPIENT GETS */}
          <div style={panelStyle}>
            <span style={labelStyle}>Recipient gets</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#f5f9f8",
                  border: "2px solid #e0ebe9",
                }}
              >
                <span
                  style={{ fontSize: 16, fontWeight: 800, color: "#7a9c99" }}
                >
                  {recvCurrency.symbol}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#0d1f1e",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {receivedAmount == null ? "—" : fmt(receivedAmount)}
                </span>
              </div>
              <CurrencyDropdown
                selected={recvCurrency}
                onSelect={handleRecvChange}
                exclude={sendCurrency.code}
              />
            </div>
          </div>

          {/* FEE INPUT */}
          <div style={panelStyle}>
            <span style={labelStyle}>Fee (optional)</span>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#7a9c99",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                {sendCurrency.symbol}
              </span>
              <input
                style={{ ...inputStyle, paddingLeft: 34, fontSize: 16 }}
                type="number"
                min="0"
                step="any"
                value={rawFee}
                onChange={(e) => setRawFee(e.target.value)}
                placeholder="0.00"
                aria-label="Fee amount"
              />
            </div>
          </div>

          {/* RATE + FEE SUMMARY */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(200,241,53,0.15)",
                color: "#4a7a00",
                border: "1px solid rgba(200,241,53,0.4)",
              }}
            >
              {sendCurrency.symbol}1 = {recvCurrency.symbol}
              {manualRate > 0 ? fmt(manualRate) : "—"}
            </span>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(176,204,201,0.15)",
                color: "#3a6060",
                border: "1px solid rgba(176,204,201,0.4)",
              }}
            >
              Fee ={" "}
              {feeAmount > 0 ? `${sendCurrency.symbol}${fmt(feeAmount)}` : "—"}
            </span>
          </div>

          {/* TOTAL */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              borderRadius: 12,
              background: "#0d1f1e",
              border: "1px solid #0d1f1e",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#b0ccc9",
                letterSpacing: "0.02em",
              }}
            >
              Total to be sent
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.4px",
              }}
            >
              {sendCurrency.symbol} {fmt(totalAmount)}
            </span>
          </div>

          {/* EXECUTE */}
          <button
            type="button"
            onClick={handleExecute}
            disabled={!canExecute}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              background: canExecute ? "#C8F135" : "#e0ebe9",
              color: canExecute ? "#0d1f1e" : "#7a9c99",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "-0.2px",
              cursor: canExecute ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (canExecute) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(200,241,53,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {executing ? (
              <>
                <span className="cc-spinner" /> Processing…
              </>
            ) : (
              `Convert to ${recvCurrency.code} →`
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CurrencyConverter;
