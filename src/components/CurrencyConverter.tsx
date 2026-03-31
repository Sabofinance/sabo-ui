import React, { useState, useRef, useEffect } from 'react';
import '../assets/css/CurrencyConverter.css';
import { conversionsApi } from '../lib/api';
import { toast } from 'react-toastify';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'GBP', name: 'British Pound',  symbol: '£',   flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'USD', name: 'US Dollar',       symbol: '$',   flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: 'https://flagcdn.com/w40/ca.png' },
  { code: 'NGN', name: 'Nigerian Naira',  symbol: '₦',   flag: 'https://flagcdn.com/w40/ng.png' },
];

const fmt = (n: number, decimals = 2): string =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/* ── Dropdown ── */
interface DropdownProps {
  selected: Currency;
  onSelect: (c: Currency) => void;
  exclude: string;
}

const CurrencyDropdown: React.FC<DropdownProps> = ({ selected, onSelect, exclude }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="cc-select-wrap" ref={ref}>
      <button
        className="cc-select-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Select currency"
        type="button"
      >
        <img src={selected.flag} alt={selected.code} className="cc-select-flag" />
        <span className="cc-select-code">{selected.code}</span>
        <svg
          className={`cc-chevron ${open ? 'open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="cc-dropdown">
          {CURRENCIES.filter(c => c.code !== exclude).map(c => (
            <button
              key={c.code}
              type="button"
              className={`cc-dropdown-item ${c.code === selected.code ? 'is-selected' : ''}`}
              onClick={() => { onSelect(c); setOpen(false); }}
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
interface CurrencyConverterProps {
  onSuccess?: () => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onSuccess }) => {
  const [rawAmount,     setRawAmount]     = useState('30');
  const [sendCurrency,  setSendCurrency]  = useState<Currency>(CURRENCIES[0]); // GBP
  const [recvCurrency,  setRecvCurrency]  = useState<Currency>(CURRENCIES[3]); // NGN

 
  const amount = Math.max(0, parseFloat(rawAmount) || 0);

  const [quoteLoading, setQuoteLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [quoteError, setQuoteError] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<number | null>(null);
  const [ratePerUnit, setRatePerUnit] = useState<number | null>(null);
  const [feeAmount, setFeeAmount] = useState<number | null>(null);

  const totalAmount = feeAmount != null ? amount + feeAmount : amount;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!sendCurrency.code || !recvCurrency.code || amount <= 0) {
        setReceivedAmount(null);
        setRatePerUnit(null);
        setFeeAmount(null);
        setQuoteError('');
        return;
      }

      setQuoteLoading(true);
      setQuoteError('');

      try {
        // Fast-path for identical currencies (still derived from user input).
        if (sendCurrency.code === recvCurrency.code) {
          if (cancelled) return;
          setReceivedAmount(amount);
          setRatePerUnit(1);
          setFeeAmount(0);
          return;
        }

        const res = await conversionsApi.quote({
          fromCurrency: sendCurrency.code,
          toCurrency: recvCurrency.code,
          amount,
        });

        if (!res.success) {
          if (cancelled) return;
          setQuoteError(res.error?.message || 'Failed to quote conversion');
          setReceivedAmount(null);
          setRatePerUnit(null);
          setFeeAmount(null);
          return;
        }

        const d = res.data as any;

        const receivedV = Number(
          d?.received ?? d?.amountReceived ?? d?.toAmount ?? d?.amountOut ?? d?.outputAmount ?? d?.value ?? 0,
        );
        const rateV = Number(d?.rate ?? d?.exchangeRate ?? d?.unitRate ?? d?.valuePerUnit ?? 0);
        const feeRaw = d?.feeAmount ?? d?.fee ?? d?.platformFee ?? d?.serviceFee ?? null;
        const feeV = feeRaw == null ? null : Number(feeRaw);

        if (cancelled) return;
        setReceivedAmount(Number.isFinite(receivedV) ? receivedV : null);
        setRatePerUnit(Number.isFinite(rateV) && rateV > 0 ? rateV : null);
        setFeeAmount(feeV != null && Number.isFinite(feeV) ? feeV : null);
      } catch (err: any) {
        if (cancelled) return;
        setQuoteError(err?.message || 'Failed to quote conversion');
        setReceivedAmount(null);
        setRatePerUnit(null);
        setFeeAmount(null);
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [amount, sendCurrency.code, recvCurrency.code]);

  useEffect(() => {
    if (!quoteError) return;
    toast.error(quoteError);
  }, [quoteError, toast]);

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

  const handleExecute = async () => {
    if (!sendCurrency.code || !recvCurrency.code || amount <= 0 || executing) return;
    
    setExecuting(true);
    try {
      const res = await conversionsApi.create({
        from: sendCurrency.code,
        to: recvCurrency.code,
        amount,
      });

      if (res.success) {
        toast.success('Conversion successful!');
        setRawAmount('');
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error?.message || 'Conversion failed');
      }
    } catch (err: any) {
      toast.error(err?.message || 'An unexpected error occurred');
    } finally {
      setExecuting(false);
    }
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
              onChange={e => setRawAmount(e.target.value)}
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
            <span className="cc-output">
              {quoteLoading ? '—' : receivedAmount == null ? '—' : fmt(receivedAmount)}
            </span>
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
          {quoteLoading || ratePerUnit == null ? '—' : fmt(ratePerUnit)}
        </span>
        <span className="cc-badge cc-badge--fee">
          Fee = {feeAmount == null ? '—' : `${sendCurrency.symbol}${fmt(feeAmount)}`}
        </span>
      </div>

      {/* TOTAL */}
      <div className="cc-total-row">
        <span className="cc-total-label">Total amount to be sent</span>
        <span className="cc-total-value">
          {sendCurrency.symbol} {fmt(totalAmount)}
        </span>
      </div>

      {/* EXECUTE BUTTON */}
      <button 
        className="cc-execute-btn" 
        onClick={handleExecute} 
        disabled={quoteLoading || executing || amount <= 0 || receivedAmount === null}
        style={{
          width: '100%',
          marginTop: '24px',
          padding: '18px',
          borderRadius: '16px',
          background: '#C8F032',
          border: 'none',
          color: '#0A1E28',
          fontWeight: 800,
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          opacity: (quoteLoading || executing || amount <= 0 || receivedAmount === null) ? 0.6 : 1
        }}
      >
        {executing ? 'Processing...' : `Convert to ${recvCurrency.code}`}
      </button>

    </div>
  );
};

export default CurrencyConverter;