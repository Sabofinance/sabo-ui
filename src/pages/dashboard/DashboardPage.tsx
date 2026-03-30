import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellModal from '../../components/SellModal';
import DepositModal from '../../components/DepositModal';
import { type ActivityChartPoint } from '../../components/ActivityChart';
import LedgerVolumeAreaChart from '../../components/LedgerVolumeAreaChart';
import DepositsWithdrawalsBarChart, { type DepositsWithdrawalsPoint } from '../../components/DepositsWithdrawalsBarChart';
import WalletBalancesBarChart, { type WalletBarPoint } from '../../components/WalletBalancesBarChart';
import ConversionsTrendBarChart, { type ConversionTrendPoint } from '../../components/ConversionsTrendBarChart';
import TransactionHistory, { type TransactionItem } from '../../components/TransactionHistory';
import { conversionsApi, depositsApi, ledgerApi, ratesApi, sabitsApi, withdrawalsApi, walletsApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/* ─── Types ──────────────────────────────────────────────── */
type WalletView = {
  id: string; currency: string; balance: number; symbol: string;
  cardNumber: string; cardHolder: string; expiry: string;
  income: number; outcome: number; limit: number;
};
type SellerView = {
  id: number; name: string; avatar: string; amount: number;
  currency: string; rate: number; rating: number; completed: number;
  type: 'buy' | 'sell';
};

/* ─── Constants ──────────────────────────────────────────── */
const FLAG_URLS: Record<string, string> = {
  NGN: 'https://flagcdn.com/w80/ng.png',
  GBP: 'https://flagcdn.com/w80/gb.png',
  USD: 'https://flagcdn.com/w80/us.png',
  EUR: 'https://flagcdn.com/w80/eu.png',
  CAD: 'https://flagcdn.com/w80/ca.png',
};

const CURRENCY_META: Record<string, { accent: string; light: string; text: string }> = {
  NGN: { accent: '#4f7c00', light: '#eefac8', text: '#3a5c00' },
  USD: { accent: '#0a7c4e', light: '#d1fae5', text: '#065f46' },
  GBP: { accent: '#1d4ed8', light: '#dbeafe', text: '#1e40af' },
  CAD: { accent: '#b45309', light: '#fef3c7', text: '#92400e' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-NG').format(n);
const currSym = (c: string) => ({ NGN: '₦', USD: '$', GBP: '£', CAD: 'CA$' }[c] ?? '');

/* ─── Global CSS ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dp-root {
    --accent: #b5e516;
    --accent-dark: #8aae00;
    --accent-bg: #f3fcd4;
    --surface: #ffffff;
    --surface-2: #f7f8fa;
    --surface-3: #f0f2f5;
    --border: #e4e8ef;
    --border-strong: #d0d6e0;
    --text-primary: #0e1726;
    --text-secondary: #5a6478;
    --text-muted: #9aa3b3;
    --success: #16a34a;
    --success-bg: #dcfce7;
    --danger: #dc2626;
    --danger-bg: #fee2e2;
    --shadow-sm: 0 1px 3px rgba(14,23,38,0.06), 0 1px 2px rgba(14,23,38,0.04);
    --shadow-md: 0 4px 16px rgba(14,23,38,0.08), 0 2px 6px rgba(14,23,38,0.04);
    --shadow-lg: 0 12px 40px rgba(14,23,38,0.10), 0 4px 12px rgba(14,23,38,0.06);
    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 24px;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--surface-2);
    color: var(--text-primary);
    min-height: 100vh;
  }

  .dp-root h1, .dp-root h2, .dp-root h3, .dp-root h4 {
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  }

  /* Layout */
  .dp-page { padding: clamp(16px, 3vw, 32px); max-width: 1440px; margin: 0 auto; }
  .dp-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 1100px) { .dp-grid { grid-template-columns: 1fr; } }

  .dp-col { display: flex; flex-direction: column; gap: 16px; }

  /* Card base */
  .dp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
  .dp-card-pad { padding: 22px 24px; }

  /* Welcome */
  .dp-welcome {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }
  .dp-welcome h1 {
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text-primary);
    line-height: 1.2;
  }
  .dp-welcome p { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

  /* Rate pill */
  .dp-rate-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-radius: 99px;
    background: var(--accent-bg); border: 1px solid #d4f07a;
    font-size: 13px; font-weight: 600; color: var(--accent-dark);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Wallet carousel card */
  .dp-wallet-hero {
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    position: relative;
  }
  .dp-wallet-hero-bg {
    background: linear-gradient(140deg, #0e1726 0%, #1c2d48 60%, #0e1726 100%);
    padding: 28px 28px 24px;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .dp-wallet-hero-bg::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(181,229,22,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .dp-wallet-hero-bg::after {
    content: '';
    position: absolute; bottom: -40px; left: 30%;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(181,229,22,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .dp-wallet-actions-bar {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    background: var(--surface); gap: 0;
  }
  .dp-wallet-action-btn {
    padding: 16px 8px; border: none; background: transparent;
    cursor: pointer; font-family: inherit; font-weight: 600; font-size: 13px;
    color: var(--text-secondary); border-top: 1px solid var(--border);
    transition: background 0.15s, color 0.15s;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .dp-wallet-action-btn:not(:last-child) { border-right: 1px solid var(--border); }
  .dp-wallet-action-btn:hover { background: var(--surface-3); color: var(--text-primary); }
  .dp-wallet-action-btn.primary {
    background: var(--accent-bg); color: var(--accent-dark);
    font-weight: 700;
  }
  .dp-wallet-action-btn.primary:hover { background: #e6faa0; }

  /* Wallet pills */
  .dp-wallet-pills {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  @media (max-width: 600px) { .dp-wallet-pills { grid-template-columns: repeat(2, 1fr); } }
  .dp-wallet-pill {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--radius-md); padding: 14px 16px;
    cursor: pointer; transition: all 0.18s;
    box-shadow: var(--shadow-sm);
  }
  .dp-wallet-pill:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .dp-wallet-pill.active { border-color: var(--accent-dark); background: var(--accent-bg); }

  /* Section header */
  .dp-section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .dp-section-head h3 { font-size: 15px; font-weight: 700; }

  /* Tag / badge */
  .dp-tag {
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 99px; letter-spacing: 0.3px;
  }
  .dp-tag-accent { background: var(--accent-bg); color: var(--accent-dark); }
  .dp-tag-success { background: var(--success-bg); color: var(--success); }
  .dp-tag-danger { background: var(--danger-bg); color: var(--danger); }
  .dp-tag-blue { background: #dbeafe; color: #1d4ed8; }
  .dp-tag-neutral { background: var(--surface-3); color: var(--text-secondary); }

  /* Table */
  .dp-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: var(--radius-md); }
  .dp-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 480px; }
  .dp-table th {
    text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--text-muted); background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }
  .dp-table th:first-child { border-radius: var(--radius-sm) 0 0 0; }
  .dp-table th:last-child  { border-radius: 0 var(--radius-sm) 0 0; }
  .dp-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .dp-table tr:last-child td { border-bottom: none; }
  .dp-table tr:hover td { background: var(--surface-2); }

  /* Action button in table */
  .dp-table-action {
    padding: 6px 16px; border-radius: 99px; border: none;
    font-weight: 700; font-size: 12px; cursor: pointer;
    font-family: inherit; transition: opacity 0.15s;
  }
  .dp-table-action:hover { opacity: 0.85; }

  /* Stat bar */
  .dp-stat-bar-track {
    height: 6px; border-radius: 99px;
    background: var(--surface-3); overflow: hidden; margin-top: 8px;
  }
  .dp-stat-bar-fill { height: 100%; border-radius: 99px; transition: width 0.9s cubic-bezier(.22,1,.36,1); }

  /* Exchange rate boxes */
  .dp-rate-box {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: var(--radius-md);
    background: var(--surface-2); border: 1px solid var(--border);
  }

  /* Nav arrows */
  .dp-nav-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
    z-index: 5; transition: background 0.15s;
  }
  .dp-nav-arrow:hover { background: rgba(255,255,255,0.22); }
  .dp-nav-arrow.left { left: 10px; }
  .dp-nav-arrow.right { right: 10px; }

  /* Dot indicators */
  .dp-dots { display: flex; justify-content: center; gap: 6px; margin-top: 16px; }
  .dp-dot { height: 5px; border-radius: 99px; background: rgba(255,255,255,0.25); transition: all 0.3s; }
  .dp-dot.active { width: 20px; background: var(--accent); }
  .dp-dot:not(.active) { width: 5px; }

  /* Sparkline */
  .dp-sparkline { width: 100%; height: 44px; display: block; }

  /* Income/outcome chips */
  .dp-stat-chip { padding: 12px 14px; border-radius: var(--radius-md); background: rgba(255,255,255,0.08); }
  .dp-stat-chip small { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; opacity: 0.6; }
  .dp-stat-chip .val { font-size: 17px; font-weight: 800; margin-top: 3px; display: block; }

  /* Animations */
  @keyframes dp-rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .dp-rise { animation: dp-rise 0.45s cubic-bezier(.22,1,.36,1) both; }
  .dp-delay-1 { animation-delay: 0.04s; }
  .dp-delay-2 { animation-delay: 0.09s; }
  .dp-delay-3 { animation-delay: 0.14s; }
  .dp-delay-4 { animation-delay: 0.19s; }
  .dp-delay-5 { animation-delay: 0.24s; }
  .dp-delay-6 { animation-delay: 0.29s; }

  /* Select */
  .dp-select {
    width: 100%; padding: 9px 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: var(--surface); color: var(--text-primary);
    font-size: 13px; font-weight: 600; font-family: inherit;
    outline: none; cursor: pointer;
  }
  .dp-select:focus { border-color: var(--accent-dark); }

  /* Empty state */
  .dp-empty { text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 13px; }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dp-wallet-hero-bg { padding: 22px 20px 18px; }
    .dp-card-pad { padding: 18px; }
    .dp-welcome h1 { font-size: 20px; }
  }
  @media (max-width: 480px) {
    .dp-page { padding: 12px; }
    .dp-wallet-actions-bar { grid-template-columns: 1fr 1fr; }
    .dp-wallet-action-btn:nth-child(3) { grid-column: 1 / -1; border-right: none; }
  }
`;

/* ─── Sparkline Component ─────────────────────────────────── */
const Sparkline: React.FC<{ values: number[]; color?: string }> = ({ values, color = '#b5e516' }) => {
  if (values.length < 2) return <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa3b3', fontSize: 12 }}>No history</div>;
  const W = 300, H = 44, pad = 6;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyPts = `0,${H} ${pts.join(' ')} ${W},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dp-sparkline" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spkGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={polyPts} fill="url(#spkGrad)" />
      <polyline points={pts.join(' ')} stroke={color} strokeWidth="2.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Wallet Hero Card ────────────────────────────────────── */
const WalletHero: React.FC<{
  wallets: WalletView[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  buyTargetCurrency: string;
  onBuyTargetChange: (c: string) => void;
  onDeposit: () => void;
  onSell: () => void;
  onBuy: () => void;
}> = ({ wallets, activeIndex, onPrev, onNext, buyTargetCurrency, onBuyTargetChange, onDeposit, onSell, onBuy }) => {
  const w = wallets[activeIndex];
  if (!w) return null;

  const meta = CURRENCY_META[w.currency] ?? CURRENCY_META.NGN;
  const flagUrl = FLAG_URLS[w.currency];

  return (
    <div className="dp-wallet-hero">
      {/* Dark hero section */}
      <div className="dp-wallet-hero-bg" style={{ position: 'relative' }}>
        {/* Nav arrows */}
        <button className="dp-nav-arrow left" onClick={onPrev} aria-label="Previous wallet">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <button className="dp-nav-arrow right" onClick={onNext} aria-label="Next wallet">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </button>

        {/* Top row: flag + currency + card chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {flagUrl && (
              <img src={flagUrl} alt={w.currency}
                style={{ width: 36, height: 24, borderRadius: 4, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
                Active Wallet
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.5px' }}>{w.currency}</div>
            </div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 99,
            background: `${meta.light}22`, border: `1px solid ${meta.accent}44`, color: meta.accent,
            letterSpacing: '0.5px',
          }}>
            {w.cardHolder || 'SABO FINANCE'}
          </div>
        </div>

        {/* Balance */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
            Current Balance
          </div>
          <div style={{ fontSize: 'clamp(30px,5vw,46px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1, color: '#fff' }}>
            {w.symbol}{fmt(w.balance)}
          </div>
        </div>

        {/* Card number + expiry */}
        {w.cardNumber && (
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: '2.5px', color: 'rgba(255,255,255,0.5)' }}>
              {w.cardNumber}
            </span>
            {w.expiry && (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Exp. {w.expiry}</span>
            )}
          </div>
        )}

        {/* Income / Outcome */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
          <div className="dp-stat-chip">
            <small>Income</small>
            <span className="val" style={{ color: '#86efac' }}>{w.symbol}{fmt(w.income)}</span>
          </div>
          <div className="dp-stat-chip">
            <small>Outcome</small>
            <span className="val" style={{ color: '#fca5a5' }}>{w.symbol}{fmt(w.outcome)}</span>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="dp-dots">
          {wallets.map((_, i) => (
            <div key={i} className={`dp-dot ${i === activeIndex ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Buy target selector — only for NGN */}
      {w.currency === 'NGN' && (
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 6 }}>
            Buy Currency
          </label>
          <select className="dp-select" value={buyTargetCurrency} onChange={e => onBuyTargetChange(e.target.value)}>
            {wallets.filter(wx => wx.currency !== 'NGN').map(wx => (
              <option key={wx.currency} value={wx.currency}>{wx.currency}</option>
            ))}
          </select>
        </div>
      )}

      {/* Action buttons */}
      <div className="dp-wallet-actions-bar">
        <button className="dp-wallet-action-btn" onClick={onDeposit}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Deposit
        </button>
        <button className="dp-wallet-action-btn primary" onClick={onSell}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 10 12 5 7 10" /><line x1="12" y1="5" x2="12" y2="19" />
          </svg>
          SELL {w.currency}
        </button>
        <button className="dp-wallet-action-btn" onClick={onBuy}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13" /><line x1="12" y1="18" x2="12" y2="6" />
          </svg>
          BUY {w.currency}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [activeWalletIndex, setActiveWalletIndex] = useState(0);

  const walletCurrencies = useMemo(() => [
    { code: 'NGN', symbol: '₦' },
    { code: 'USD', symbol: '$' },
    { code: 'GBP', symbol: '£' },
    { code: 'CAD', symbol: 'CA$' },
  ], []);

  const initWallets = (): WalletView[] => walletCurrencies.map(c => ({
    id: c.code, currency: c.code, balance: 0, symbol: c.symbol,
    cardNumber: '', cardHolder: '', expiry: '', income: 0, outcome: 0, limit: 0,
  }));

  const [wallets, setWallets] = useState<WalletView[]>(initWallets);
  const [marketListings, setMarketListings] = useState<SellerView[]>([]);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyTargetCurrency, setBuyTargetCurrency] = useState('GBP');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const [activityPoints, setActivityPoints] = useState<ActivityChartPoint[]>(() => buildEmpty7('activity') as ActivityChartPoint[]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [depositWithdrawalPoints, setDepositWithdrawalPoints] = useState<DepositsWithdrawalsPoint[]>(() => buildEmpty7('depwd') as DepositsWithdrawalsPoint[]);
  const [depositWithdrawalLoading, setDepositWithdrawalLoading] = useState(false);
  const [depositWithdrawalError, setDepositWithdrawalError] = useState('');
  const [conversionPoints, setConversionPoints] = useState<ConversionTrendPoint[]>(() => buildEmpty7('conv') as ConversionTrendPoint[]);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState('');
  const [tradingStats, setTradingStats] = useState<{ label: string; pct: number; type: 'buy' | 'sell' }[]>([]);
  const [rateHistoryValues, setRateHistoryValues] = useState<number[]>([]);

  useEffect(() => {
    const dayMs = 86400000;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [walletRes, listingRes, ratesRes] = await Promise.all([
          walletsApi.list(),
          sabitsApi.list({ status: 'active', limit: 6 }),
          ratesApi.getByPair('NGN', 'GBP'),
        ]);

        if (walletRes.success && Array.isArray(walletRes.data)) {
          const wMap = new Map<string, Record<string, unknown>>(
            walletRes.data.map((w: Record<string, unknown>) => [String(w.currency || ''), w]));
          setWallets(walletCurrencies.map((c, idx) => {
            const w = wMap.get(c.code) || {};
            return {
              id: String((w as any).id || c.code || idx),
              currency: c.code, balance: Number((w as any).balance || 0),
              symbol: String((w as any).symbol || c.symbol),
              cardNumber: String((w as any).cardNumber || ''),
              cardHolder: String((w as any).cardHolder || ''),
              expiry: String((w as any).expiry || ''),
              income: Number((w as any).income || 0),
              outcome: Number((w as any).outcome || 0),
              limit: Number((w as any).limit || 0),
            };
          }));
          const foreign = walletCurrencies.filter(c => c.code !== 'NGN').map(c => c.code);
          setBuyTargetCurrency(prev => foreign.includes(prev) ? prev : foreign[0] || 'GBP');
        } else if (!walletRes.success) {
          setError(walletRes.error?.message || 'Failed to load wallets');
        }

        if (listingRes.success && Array.isArray(listingRes.data)) {
          setMarketListings(listingRes.data.map((item: Record<string, unknown>, i: number) => ({
            id: Number(item.id || i + 1),
            name: String(item.sellerName || item.name || ''),
            avatar: String(item.avatar || ''),
            amount: Number(item.amount || 0),
            currency: String(item.currency || 'NGN'),
            rate: Number(item.rate || 0),
            rating: Number(item.rating || 0),
            completed: Number(item.completed || 0),
            type: item.type === 'sell' ? 'sell' : 'buy',
          })));
        }

        if (ratesRes.success && ratesRes.data && typeof ratesRes.data === 'object') {
          const typed = ratesRes.data as Record<string, unknown>;
          setRate(Number(typed.rate || typed.value || 0));
        }

        setActivityLoading(true); setRecentLoading(true);
        setDepositWithdrawalLoading(true); setConversionLoading(true);

        const [ledgerRes, rateHistoryRes, depositsRes, withdrawalsRes, conversionsRes] = await Promise.all([
          ledgerApi.listEntries({ limit: 50 }),
          ratesApi.list({ base: 'NGN', quote: 'GBP', range: '7d' }),
          depositsApi.list({ limit: 50 }),
          withdrawalsApi.list({ limit: 50 }),
          conversionsApi.list({ limit: 50 }),
        ]);

        /* ledger / transactions / activity */
        if (ledgerRes.success && Array.isArray(ledgerRes.data)) {
          const allMapped = ledgerRes.data.map((entry: Record<string, unknown>, idx: number) => {
            const counterparty = (entry.counterpartyName as string) || (entry.counterparty as any)?.name || '';
            const avatar = (entry.counterpartyAvatar as string) || (entry.counterparty as any)?.avatar || '';
            const typeRaw = String(entry.type || 'buy');
            const type: TransactionItem['type'] = typeRaw === 'sell' ? 'sell' : 'buy';
            const statusRaw = String(entry.status || 'completed');
            const status: TransactionItem['status'] = ['pending', 'cancelled', 'completed'].includes(statusRaw)
              ? (statusRaw as TransactionItem['status']) : 'completed';
            const amount = Number(entry.amount || 0);
            const rateVal = Number(entry.rate || entry.exchangeRate || 0);
            const total = Number(entry.total || entry.value || 0) || amount * rateVal;
            return {
              id: Number(entry.id || idx + 1), type, currency: String(entry.currency || ''),
              amount, rate: rateVal, total, counterparty, avatar,
              date: String(entry.date || entry.createdAt || new Date().toISOString()), status,
            };
          });
          setRecentTransactions(allMapped.slice(0, 3));

          const buckets = make7Buckets(dayMs);
          for (const tx of allMapped) {
            if (tx.status !== 'completed') continue;
            const t = new Date(tx.date).getTime();
            if (!Number.isFinite(t)) continue;
            const b = buckets.find(b => t >= b.start && t < b.end);
            if (b) { b.trades!++; b.volume! += tx.total || 0; }
          }
          setActivityPoints(buckets.map(b => ({ day: b.label, trades: b.trades!, volume: b.volume! })));

          const buyVol = allMapped.filter(t => t.type === 'buy' && t.status === 'completed').reduce((s, t) => s + t.total, 0);
          const sellVol = allMapped.filter(t => t.type === 'sell' && t.status === 'completed').reduce((s, t) => s + t.total, 0);
          const totalVol = buyVol + sellVol;
          setTradingStats([
            { label: 'Buying Volume', pct: totalVol > 0 ? (buyVol / totalVol) * 100 : 0, type: 'buy' },
            { label: 'Selling Volume', pct: totalVol > 0 ? (sellVol / totalVol) * 100 : 0, type: 'sell' },
          ]);
        } else if (!ledgerRes.success) {
          setRecentError(ledgerRes.error?.message || 'Failed to load transactions');
          setActivityError(ledgerRes.error?.message || 'Failed to load activity');
        }

        /* deposits / withdrawals */
        const depBuckets = make7Buckets(dayMs);
        const addToBucket = (dateValue: unknown, amountValue: unknown, key: 'deposits' | 'withdrawals') => {
          const t = new Date(String(dateValue || '')).getTime();
          if (!Number.isFinite(t)) return;
          const b = depBuckets.find(b => t >= b.start && t < b.end);
          if (!b) return;
          const amt = Number(amountValue || 0);
          if (!Number.isFinite(amt) || amt <= 0) return;
          (b as any)[key] = ((b as any)[key] || 0) + amt;
        };
        if (depositsRes.success && Array.isArray(depositsRes.data)) {
          for (const dep of depositsRes.data) {
            const d = dep as Record<string, unknown>;
            addToBucket(d.date ?? d.createdAt ?? d.created_at ?? d.timestamp, d.amount ?? d.value, 'deposits');
          }
        }
        if (withdrawalsRes.success && Array.isArray(withdrawalsRes.data)) {
          for (const w of withdrawalsRes.data) {
            const wd = w as Record<string, unknown>;
            addToBucket(wd.date ?? wd.createdAt ?? wd.created_at ?? wd.timestamp, wd.amount ?? wd.value, 'withdrawals');
          }
        }
        if ((!depositsRes.success || !Array.isArray(depositsRes.data)) && (!withdrawalsRes.success || !Array.isArray(withdrawalsRes.data))) {
          setDepositWithdrawalError(depositsRes.error?.message || withdrawalsRes.error?.message || 'Failed to load deposits/withdrawals');
          setDepositWithdrawalPoints(buildEmpty7('depwd') as DepositsWithdrawalsPoint[]);
        } else {
          setDepositWithdrawalPoints(depBuckets.map(b => ({ day: b.label, deposits: (b as any).deposits || 0, withdrawals: (b as any).withdrawals || 0 })));
        }

        /* conversions */
        const convBuckets = make7Buckets(dayMs);
        if (conversionsRes.success && Array.isArray(conversionsRes.data)) {
          for (const c of conversionsRes.data) {
            const conv = c as Record<string, unknown>;
            const t = new Date(String(conv.date ?? conv.createdAt ?? conv.created_at ?? conv.timestamp ?? '')).getTime();
            if (!Number.isFinite(t)) continue;
            const b = convBuckets.find(b => t >= b.start && t < b.end);
            if (!b) continue;
            const amt = Number(conv.amount ?? conv.value ?? conv.total ?? 0);
            if (Number.isFinite(amt) && amt > 0) (b as any).value = ((b as any).value || 0) + amt;
          }
          setConversionPoints(convBuckets.map(b => ({ day: b.label, value: (b as any).value || 0 })));
        } else {
          setConversionError(conversionsRes.error?.message || 'Failed to load conversions');
          setConversionPoints(buildEmpty7('conv') as ConversionTrendPoint[]);
        }

        /* rate history */
        if (rateHistoryRes.success && Array.isArray(rateHistoryRes.data)) {
          const values = rateHistoryRes.data
            .map((x: Record<string, unknown>) => ({ v: Number(x.rate ?? x.value ?? x.exchangeRate ?? 0), date: String(x.date || x.createdAt || '') }))
            .filter(x => Number.isFinite(x.v) && x.v > 0);
          values.sort((a, b) => a.date.localeCompare(b.date));
          setRateHistoryValues(values.map(x => x.v).slice(-10));
        }

      } catch (err: any) {
        setError('An unexpected error occurred while loading dashboard data'); void err;
      } finally {
        setLoading(false); setActivityLoading(false);
        setRecentLoading(false); setDepositWithdrawalLoading(false); setConversionLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => { if (error) toast.error(error); }, [error, toast]);

  const activeWallet = wallets[activeWalletIndex];
  const nextWallet = () => setActiveWalletIndex(i => wallets.length ? (i + 1) % wallets.length : 0);
  const prevWallet = () => setActiveWalletIndex(i => wallets.length ? (i - 1 + wallets.length) % wallets.length : 0);

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Account';
  const displayRate = useMemo(() => rate ?? null, [rate]);
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }, []);

  const handleSellSubmit = async (amountSent: number, rateValue: number, amountReceived: number, receiveCurrency: string) => {
    const payload = activeWallet.currency === 'NGN'
      ? { type: 'buy', currency: receiveCurrency, amount: amountReceived, rate: rateValue, status: 'active' }
      : { type: 'sell', currency: activeWallet.currency, amount: amountSent, rate: rateValue, status: 'active' };
    const res = await sabitsApi.create(payload as Record<string, unknown>);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create sabit');
  };

  /* ── Render ── */
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="dp-root" style={{ opacity: loading ? 0.9 : 1, transition: 'opacity 0.3s' }}>
        <div className="dp-page">

          {/* Welcome row */}
          <div className="dp-welcome dp-rise">
            <div>
              <h1>{greeting}{displayName ? `, ${displayName}` : ''}! 👋</h1>
              <p>Get a summary of your weekly online transactions here.</p>
            </div>
            {displayRate !== null && (
              <div className="dp-rate-pill">
                <div style={{ display: 'flex' }}>
                  {[FLAG_URLS.NGN, FLAG_URLS.GBP].map((url, i) => (
                    <img key={i} src={url} alt="" style={{
                      width: 20, height: 14, borderRadius: 2, objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.08)',
                      marginLeft: i > 0 ? -5 : 0,
                    }} />
                  ))}
                </div>
                NGN/GBP · ₦{fmt(displayRate)}
                <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: 99, fontWeight: 700 }}>
                  ▲ 2.4%
                </span>
              </div>
            )}
          </div>

          {/* Main grid */}
          <div className="dp-grid">

            {/* ── Left column ── */}
            <div className="dp-col">

              {/* Wallet hero */}
              <div className="dp-rise dp-delay-1">
                <WalletHero
                  wallets={wallets}
                  activeIndex={activeWalletIndex}
                  onPrev={prevWallet}
                  onNext={nextWallet}
                  buyTargetCurrency={buyTargetCurrency}
                  onBuyTargetChange={setBuyTargetCurrency}
                  onDeposit={() => setIsDepositModalOpen(true)}
                  onSell={() => setIsSellModalOpen(true)}
                  onBuy={() => navigate('/dashboard/active-sabits')}
                />
              </div>

              {/* Wallet pills */}
              <div className="dp-wallet-pills dp-rise dp-delay-2">
                {wallets.map((w, idx) => {
                  const meta = CURRENCY_META[w.currency] ?? CURRENCY_META.NGN;
                  const isActive = idx === activeWalletIndex;
                  return (
                    <div key={w.currency}
                      className={`dp-wallet-pill ${isActive ? 'active' : ''}`}
                      role="button" tabIndex={0}
                      onClick={() => setActiveWalletIndex(idx)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActiveWalletIndex(idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {FLAG_URLS[w.currency] && (
                          <img src={FLAG_URLS[w.currency]} alt={w.currency}
                            style={{ width: 22, height: 15, borderRadius: 2, objectFit: 'cover', border: '1px solid var(--border)' }} />
                        )}
                        <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? meta.text : 'var(--text-muted)', letterSpacing: '0.5px' }}>
                          {w.currency}
                        </span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: isActive ? meta.accent : 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                        {w.symbol}{fmt(w.balance)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>Balance</div>
                    </div>
                  );
                })}
              </div>

              {/* Marketplace */}
              <div className="dp-card dp-card-pad dp-rise dp-delay-3">
                <div className="dp-section-head">
                  <h3>Active Sabit Marketplace</h3>
                  <span className="dp-tag dp-tag-accent">Live · {marketListings.length} listings</span>
                </div>
                {marketListings.length === 0 ? (
                  <div className="dp-empty">No active listings at the moment.</div>
                ) : (
                  <div className="dp-table-wrap">
                    <table className="dp-table">
                      <thead>
                        <tr>
                          {['Seller', 'Type', 'Rate (NGN)', 'Amount', 'Action'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {marketListings.map(seller => (
                          <tr key={seller.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img src={seller.avatar} alt={seller.name}
                                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', background: 'var(--surface-3)', flexShrink: 0 }} />
                                <span style={{ fontWeight: 600 }}>{seller.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`dp-tag ${seller.type === 'sell' ? 'dp-tag-danger' : 'dp-tag-success'}`}>
                                {seller.type === 'sell' ? 'SELL SABIT' : 'BUY SABIT'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>₦{fmt(seller.rate)}</span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>
                              {currSym(seller.currency)}{fmt(seller.amount)} {seller.currency}
                            </td>
                            <td>
                              <button
                                className="dp-table-action"
                                onClick={() => navigate(`/dashboard/transaction/${seller.id}`)}
                                style={{
                                  background: seller.type === 'sell' ? 'var(--success-bg)' : 'var(--danger-bg)',
                                  color: seller.type === 'sell' ? 'var(--success)' : 'var(--danger)',
                                }}>
                                {seller.type === 'sell' ? 'Buy' : 'Sell'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Transaction History */}
              <div className="dp-card dp-rise dp-delay-4">
                <TransactionHistory
                  onViewAll={() => navigate('/dashboard/history')}
                  transactions={recentTransactions}
                  loading={recentLoading}
                  error={recentError}
                />
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="dp-col">

              {/* Wallet balances chart */}
              <div className="dp-card dp-rise dp-delay-1">
                <WalletBalancesBarChart
                  points={wallets.map((w): WalletBarPoint => ({ currency: w.currency, balance: w.balance }))}
                />
              </div>

              {/* Trading stats */}
              <div className="dp-card dp-card-pad dp-rise dp-delay-2">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Trading Statistics</h3>
                {tradingStats.length ? tradingStats.map(bar => (
                  <div key={bar.type} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{bar.label}</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{bar.pct.toFixed(1)}%</span>
                    </div>
                    <div className="dp-stat-bar-track">
                      <div className="dp-stat-bar-fill" style={{
                        width: `${bar.pct}%`,
                        background: bar.type === 'buy'
                          ? 'linear-gradient(90deg,#4ade80,#16a34a)'
                          : 'linear-gradient(90deg,#f87171,#dc2626)',
                      }} />
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No statistics yet.</p>
                )}
              </div>

              {/* Exchange Rate */}
              <div className="dp-card dp-card-pad dp-rise dp-delay-3">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Exchange Rate</h3>
                  <span className="dp-tag dp-tag-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    ▲ 2.4%
                  </span>
                </div>

                {/* Sparkline */}
                <div style={{ marginBottom: 14, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <Sparkline values={rateHistoryValues} color="#8aae00" />
                </div>

                {/* Rate rows */}
                {[
                  { from: 'NGN', to: 'GBP', fromF: FLAG_URLS.NGN, toF: FLAG_URLS.GBP },
                  { from: 'GBP', to: 'NGN', fromF: FLAG_URLS.GBP, toF: FLAG_URLS.NGN },
                ].map(({ from, to, fromF, toF }) => (
                  <div key={`${from}${to}`} className="dp-rate-box" style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex' }}>
                        <img src={fromF} alt={from} style={{ width: 24, height: 16, borderRadius: 3, objectFit: 'cover', border: '1px solid var(--border)' }} />
                        <img src={toF} alt={to} style={{ width: 24, height: 16, borderRadius: 3, objectFit: 'cover', border: '1px solid var(--border)', marginLeft: -6, zIndex: 1 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{from} → {to}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-dark)' }}>
                        {displayRate === null ? '—' : `₦${fmt(displayRate)}`}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>per £1</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart widgets */}
              <div className="dp-card dp-rise dp-delay-4">
                <DepositsWithdrawalsBarChart points={depositWithdrawalPoints} loading={depositWithdrawalLoading} error={depositWithdrawalError} />
              </div>
              <div className="dp-card dp-rise dp-delay-5">
                <ConversionsTrendBarChart points={conversionPoints} loading={conversionLoading} error={conversionError} />
              </div>
              <div className="dp-card dp-rise dp-delay-6">
                <LedgerVolumeAreaChart points={activityPoints} loading={activityLoading} error={activityError} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSellModalOpen && (
        <SellModal
          currency={activeWallet.currency}
          balance={activeWallet.balance}
          symbol={activeWallet.symbol}
          targetCurrency={buyTargetCurrency}
          onClose={() => setIsSellModalOpen(false)}
          onSubmit={handleSellSubmit}
        />
      )}
      {isDepositModalOpen && (
        <DepositModal
          onClose={() => setIsDepositModalOpen(false)}
          defaultCurrency={activeWallet.currency as any}
        />
      )}
    </>
  );
};

export default DashboardPage;

/* ─── Helpers (module-level, no hooks) ──────────────────── */
function make7Buckets(dayMs: number) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * dayMs);
    const start = new Date(d.toDateString()).getTime();
    return { start, end: start + dayMs, label: d.toLocaleDateString('en-GB', { weekday: 'short' }), trades: 0, volume: 0 };
  });
}

function buildEmpty7(type: 'activity' | 'depwd' | 'conv') {
  const now = new Date(), dayMs = 86400000;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * dayMs);
    const day = d.toLocaleDateString('en-GB', { weekday: 'short' });
    if (type === 'activity') return { day, trades: 0, volume: 0 };
    if (type === 'depwd')    return { day, deposits: 0, withdrawals: 0 };
    return { day, value: 0 };
  });
}