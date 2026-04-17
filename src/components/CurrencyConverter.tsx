import React, { useState, useRef, useEffect } from "react";
import { companyRatesApi } from "../lib/api";
import { extractArray } from "../lib/api/response";
import "../assets/css/CurrencyConverter.css";

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

const NGN_RATES: Record<string, number> = {
  NGN: 1,
  GBP: 1650,
  USD: 1300,
  CAD: 960,
};

interface CurrencyConverterProps {
  onSuccess?: () => void;
}

const FLAT_FEES: Record<string, number> = {
  GBP: 1,
  USD: 1.5,
  CAD: 2,
  NGN: 1500,
};

const convertAmount = (
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number => {
  if (from === to) return amount;
  const fromRate = rates[from] ?? NGN_RATES[from] ?? 1;
  const toRate = rates[to] ?? NGN_RATES[to] ?? 1;
  return (amount * fromRate) / toRate;
};

const fmt = (n: number, decimals = 2): string =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/* ── Dropdown ── */
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
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="cc-select-wrap" ref={ref}>
      <button
        className="cc-select-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Select currency"
        type="button"
      >
        <img
          src={selected.flag}
          alt={selected.code}
          className="cc-select-flag"
        />
        <span className="cc-select-code">{selected.code}</span>
        <svg
          className={`cc-chevron ${open ? "open" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="cc-dropdown">
          {CURRENCIES.filter((c) => c.code !== exclude).map((c) => (
            <button
              key={c.code}
              type="button"
              className={`cc-dropdown-item ${c.code === selected.code ? "is-selected" : ""}`}
              onClick={() => {
                onSelect(c);
                setOpen(false);
              }}
            >
              <img src={c.flag} alt={c.code} className="cc-select-flag" />
              <span className="cc-select-code">{c.code}</span>
              <span className="cc-dropdown-name">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main converter ── */
const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onSuccess }) => {
  const [rawAmount, setRawAmount] = useState("30");
  const [sendCurrency, setSendCurrency] = useState<Currency>(CURRENCIES[0]); // GBP
  const [recvCurrency, setRecvCurrency] = useState<Currency>(CURRENCIES[3]); // NGN
  const [companyRates, setCompanyRates] = useState<Record<string, number>>({ NGN: 1 });
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState("");

  useEffect(() => {
    const loadRates = async () => {
      setRatesLoading(true);
      setRatesError("");

      try {
        const response = await companyRatesApi.list();
        if (response.success && response.data) {
          const data = response.data as any;
          const items = (Array.isArray(data?.rates) ? data.rates : extractArray(data)) as any[];
          const mappedRates = items.reduce<Record<string, number>>((acc, item) => {
            const currencyCode = String(item?.currency || item?.code || "").toUpperCase();
            const rateValue = Number(item?.rate ?? item?.rate_ngn ?? item?.rateNgn);
            if (currencyCode && !Number.isNaN(rateValue)) {
              acc[currencyCode] = rateValue;
            }
            return acc;
          }, { NGN: 1 });

          if (!mappedRates.NGN) mappedRates.NGN = 1;
          setCompanyRates(mappedRates);
          onSuccess?.();
        } else {
          setRatesError(response.error?.message || "Could not load company rates.");
        }
      } finally {
        setRatesLoading(false);
      }
    };

    void loadRates();
  }, []);

  const amount = Math.max(0, parseFloat(rawAmount) || 0);
  const fee = FLAT_FEES[sendCurrency.code] ?? 1;
  const received = convertAmount(amount, sendCurrency.code, recvCurrency.code, companyRates);
  const total = amount + fee;
  const rate = convertAmount(1, sendCurrency.code, recvCurrency.code, companyRates);

  const handleSwap = () => {
    setSendCurrency(recvCurrency);
    setRecvCurrency(sendCurrency);
  };

  const handleSendChange = (c: Currency) => {
    setSendCurrency(c);
    if (c.code === recvCurrency.code) setRecvCurrency(sendCurrency);
  };

  const handleRecvChange = (c: Currency) => {
    setRecvCurrency(c);
    if (c.code === sendCurrency.code) setSendCurrency(recvCurrency);
  };

  return (
    <div className="cc-card">
      {/* YOU'RE SENDING */}
      <div className="cc-panel">
        <span className="cc-panel-label">You're sending</span>
        <div className="cc-panel-body">
          <div className="cc-amount-group">
            <span className="cc-symbol">{sendCurrency.symbol}</span>
            <input
              className="cc-input"
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

      {/* SWAP BUTTON — large visible arrow circle like Figma */}
      <div className="cc-swap-row">
        <div className="cc-divider-line" />
        <button
          className="cc-swap-btn"
          onClick={handleSwap}
          aria-label="Swap currencies"
          type="button"
        >
          {/* Down arrow — clearly visible, matches Figma */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </button>
        <div className="cc-divider-line" />
      </div>

      {/* RECIPIENT GETS */}
      <div className="cc-panel">
        <span className="cc-panel-label">Recipient gets</span>
        <div className="cc-panel-body">
          <div className="cc-amount-group">
            <span className="cc-symbol">{recvCurrency.symbol}</span>
            <span className="cc-output">{fmt(received)}</span>
          </div>
          <CurrencyDropdown
            selected={recvCurrency}
            onSelect={handleRecvChange}
            exclude={sendCurrency.code}
          />
        </div>
      </div>

      {/* RATE + FEE BADGES */}
      <div className="cc-badges-row">
        <span className="cc-badge cc-badge--rate">
          {sendCurrency.symbol}1 = {recvCurrency.symbol}
          {fmt(rate)}
        </span>
        <span className="cc-badge cc-badge--fee">
          Fee = {sendCurrency.symbol}
          {fmt(fee)}
        </span>
      </div>

      {(ratesLoading || ratesError) && (
        <div style={{ marginTop: 12, fontSize: 12, color: ratesError ? '#dc2626' : '#64748b' }}>
          {ratesLoading ? 'Loading company rates...' : ratesError}
        </div>
      )}

      {/* TOTAL */}
      <div className="cc-total-row">
        <span className="cc-total-label">Total amount to be sent</span>
        <span className="cc-total-value">
          {sendCurrency.symbol} {fmt(total)}
        </span>
      </div>
    </div>
  );
};

export default CurrencyConverter;
