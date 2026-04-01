import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  walletsApi,
  ratesApi,
  ledgerApi,
  tradesApi,
  bidsApi,
} from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import '../../assets/css/DashboardPage.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Wallet {
  id: string;
  currency: 'NGN' | 'GBP' | 'USD' | 'CAD';
  balance: string;
  locked_balance: string;
  escrow_balance: string;
}

interface Rate {
  pair: string;
  rate: string;
  created_at: string;
}

interface LedgerEntry {
  id: string;
  reference: string;
  type: string;
  amount: string;
  currency: string;
  balance_after: string;
  status: string;
  created_at: string;
  initiated_by: string;
  related_id: string | null;
}

interface DashboardStats {
  totalBalanceNGN: number;
  activeTrades: number;
  pendingBids: number;
  tradeSuccessRate: number;
  tradesInEscrow: number;
  tradesConfirming: number;
  bidsReceived: number;
  bidsSent: number;
}

// ─── Currency config ──────────────────────────────────────────────────────────

const WALLET_CONFIG = {
  NGN: {
    symbol: '₦',
    ghost: '₦',
    name: 'Nigerian Naira',
    flag: 'https://flagcdn.com/w80/ng.png',
    flagAlt: 'NG',
    bgClass: 'wallet-ngn',
    badgeStyle: { background: 'rgba(255,255,255,0.2)', color: '#0E130C' },
    buyLabel: 'Buy NGN',
    sellLabel: 'Sell NGN',
  },
  GBP: {
    symbol: '£',
    ghost: '£',
    name: 'British Pound',
    flag: 'https://flagcdn.com/w80/gb.png',
    flagAlt: 'GB',
    bgClass: 'wallet-gbp',
    badgeStyle: { background: 'rgba(255,255,255,0.2)', color: '#0E130C' },
    buyLabel: 'Buy GBP',
    sellLabel: 'Sell GBP',
  },
  USD: {
    symbol: '$',
    ghost: '$',
    name: 'US Dollar',
    flag: 'https://flagcdn.com/w80/us.png',
    flagAlt: 'US',
    bgClass: 'wallet-usd',
    badgeStyle: { background: 'rgba(255,255,255,0.2)', color: '#0E130C' },
    buyLabel: 'Buy USD',
    sellLabel: 'Sell USD',
  },
  CAD: {
    symbol: 'C$',
    ghost: 'C$',
    name: 'Canadian Dollar',
    flag: 'https://flagcdn.com/w80/ca.png',
    flagAlt: 'CA',
    bgClass: 'wallet-cad',
    badgeStyle: { background: 'rgba(255,255,255,0.2)', color: '#0E130C' },
    buyLabel: 'Buy CAD',
    sellLabel: 'Sell CAD',
  },
};

const RATE_PAIRS = [
  {
    pair: 'GBP/NGN',
    label: 'GBP / NGN',
    sub: 'per £1.00 GBP',
    flags: [
      { src: 'https://flagcdn.com/w80/gb.png', alt: 'GB' },
      { src: 'https://flagcdn.com/w80/ng.png', alt: 'NG' },
    ],
    animDelay: '0s',
  },
  {
    pair: 'USD/NGN',
    label: 'USD / NGN',
    sub: 'per $1.00 USD',
    flags: [
      { src: 'https://flagcdn.com/w80/us.png', alt: 'US' },
      { src: 'https://flagcdn.com/w80/ng.png', alt: 'NG' },
    ],
    animDelay: '0.9s',
  },
  {
    pair: 'CAD/NGN',
    label: 'CAD / NGN',
    sub: 'per CA$1.00 CAD',
    flags: [
      { src: 'https://flagcdn.com/w80/ca.png', alt: 'CA' },
      { src: 'https://flagcdn.com/w80/ng.png', alt: 'NG' },
    ],
    animDelay: '1.8s',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBalance(amount: string, symbol: string): string {
  const num = parseFloat(amount || '0');
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatTxnAmount(entry: LedgerEntry): string {
  const num = parseFloat(entry.amount || '0');
  const symbols: Record<string, string> = { NGN: '₦', GBP: '£', USD: '$', CAD: 'C$' };
  const symbol = symbols[entry.currency] || '';
  const prefix = getAmtClass(entry.type) === 'amt-pos' ? '+' : '-';
  return `${prefix}${symbol}${num.toLocaleString()}`;
}

function getTxnType(type: string): string {
  const map: Record<string, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    trade_debit: 'Buy',
    trade_credit: 'Sell',
    escrow_hold: 'Escrow',
    escrow_release: 'Released',
    reversal: 'Reversal',
    adjustment: 'Adjustment',
  };
  return map[type] || type;
}

function getTxnPillClass(type: string): string {
  if (type === 'deposit') return 'p-dep';
  if (type === 'trade_credit') return 'p-sell';
  if (type === 'trade_debit') return 'p-buy';
  return 'p-conv';
}

function getAmtClass(type: string): string {
  const credits = ['deposit', 'trade_credit', 'escrow_release', 'reversal'];
  const debits = ['withdrawal', 'trade_debit', 'escrow_hold'];
  if (credits.includes(type)) return 'amt-pos';
  if (debits.includes(type)) return 'amt-neg';
  return 'amt-neu';
}

function getStatusClass(status: string): string {
  if (status === 'completed') return 's-done';
  if (status === 'pending' || status === 'pending_review') return 's-pend';
  if (status === 'escrowed' || status === 'initiated') return 's-esc';
  return 's-pend';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    completed: 'Completed',
    pending: 'Pending',
    pending_review: 'In Review',
    escrowed: 'In Escrow',
    initiated: 'Initiated',
    failed: 'Failed',
  };
  return map[status] || status;
}

function formatDate(d: string) {
  if (!d) return '—';
  const date = new Date(d);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, ${time}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Sparkline paths (static decorative)
const SPARKLINES: Record<string, string> = {
  'GBP/NGN': '0,22 15,18 28,20 40,12 55,14 68,8 80,10 92,5 100,6',
  'USD/NGN': '0,6 12,8 25,5 38,12 50,10 62,16 75,14 88,20 100,22',
  'CAD/NGN': '0,20 14,16 26,18 38,14 52,16 64,10 76,12 88,8 100,6',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface WalletCardProps {
  wallet: Wallet;
  onBuy: (currency: string) => void;
  onSell: (currency: string) => void;
}

function WalletCard({ wallet, onBuy, onSell }: WalletCardProps) {
  const cfg = WALLET_CONFIG[wallet.currency];
  const available = formatBalance(wallet.balance, cfg.symbol);
  const locked = formatBalance(wallet.locked_balance, cfg.symbol);

  return (
    <div className={`wallet ${cfg.bgClass}`}>
      <div className="wallet-ghost">
        {cfg.ghost}
      </div>
      <div className="wallet-top">
        <div className="wallet-flag-row">
          <img src={cfg.flag} alt={cfg.flagAlt} />
          <span className="wallet-code">{wallet.currency}</span>
        </div>
        <span className="wallet-badge">
          {cfg.name}
        </span>
      </div>
      <div className="wallet-amount">{available}</div>
      <div className="wallet-name">Available balance</div>
      <div className="wallet-footer">
        <div className="wf-col">
          <div className="wf-label">Available</div>
          <div className="wf-val">{available}</div>
        </div>
        <div className="wf-col">
          <div className="wf-label">Locked</div>
          <div className="wf-val">{locked}</div>
        </div>
      </div>
      <div className="wallet-actions">
        <button className="wbtn wbtn-buy" onClick={() => onBuy(wallet.currency)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          {cfg.buyLabel}
        </button>
        <button className="wbtn wbtn-sell" onClick={() => onSell(wallet.currency)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7 7 7-7" />
          </svg>
          {cfg.sellLabel}
        </button>
      </div>
    </div>
  );
}

interface RateCardProps {
  config: (typeof RATE_PAIRS)[0];
  rate: Rate | undefined;
}

function RateCard({ config, rate }: RateCardProps) {
  const rateVal = rate ? `₦${Math.round(parseFloat(rate.rate)).toLocaleString()}` : '—';
  const changes: Record<string, { label: string; up: boolean }> = {
    'GBP/NGN': { label: '+2.4% today', up: true },
    'USD/NGN': { label: '−0.8% today', up: false },
    'CAD/NGN': { label: '+1.1% today', up: true },
  };
  const change = changes[config.pair] || { label: '0%', up: true };
  const sparkPoints = SPARKLINES[config.pair] || '';
  const strokeColor = change.up ? '#1A7A3C' : '#C0251E';

  return (
    <div className="rate-item">
      <div className="rate-ticker" style={{ animationDelay: config.animDelay }} />
      <div className="rate-flags">
        {config.flags.map((f) => (
          <img key={f.alt} src={f.src} alt={f.alt} />
        ))}
      </div>
      <div className="rate-pair-name">{config.label}</div>
      <div className="rate-val">{rateVal}</div>
      <div className="rate-sub">{config.sub}</div>
      <div className={`rate-change ${change.up ? 'rc-up' : 'rc-dn'}`}>
        {change.up ? '▲' : '▼'} {change.label}
      </div>
      <div className="sparkline">
        <svg viewBox="0 0 100 28" width="100%" height="28" preserveAspectRatio="none">
          <polyline
            points={sparkPoints}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBalanceNGN: 0,
    activeTrades: 0,
    pendingBids: 0,
    tradeSuccessRate: 0,
    tradesInEscrow: 0,
    tradesConfirming: 0,
    bidsReceived: 0,
    bidsSent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string>('');

  // Carousel
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const movedRef = useRef(false);
  const WALLET_ORDER: Array<'NGN' | 'GBP' | 'USD' | 'CAD'> = ['NGN', 'GBP', 'USD', 'CAD'];

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      const [walletsRes, ratesRes, ledgerRes, tradesRes, bidsRecRes, bidsSentRes] = await Promise.allSettled([
        walletsApi.list(),
        ratesApi.list(),
        ledgerApi.listEntries({ limit: 5 }),
        tradesApi.list({ limit: 100 }),
        bidsApi.listReceived({ status: 'pending' }),
        bidsApi.listMine({ status: 'pending' }),
      ]);

      if (walletsRes.status === 'fulfilled' && walletsRes.value.success) {
        const w: Wallet[] = extractArray(walletsRes.value.data);
        setWallets(w);
        const ngnWallet = w.find((x) => x.currency === 'NGN');
        const totalNGN = ngnWallet ? parseFloat(ngnWallet.balance || '0') : 0;
        setStats((prev) => ({ ...prev, totalBalanceNGN: totalNGN }));
      }

      if (ratesRes.status === 'fulfilled' && ratesRes.value.success) {
        const r: Rate[] = extractArray(ratesRes.value.data);
        setRates(r);
        if (r.length > 0) {
          const latest = new Date(r[0].created_at);
          const diffMins = Math.floor((Date.now() - latest.getTime()) / 60000);
          setRatesUpdatedAt(diffMins < 1 ? 'Just now' : `${diffMins} min${diffMins > 1 ? 's' : ''} ago`);
        }
      }

      if (ledgerRes.status === 'fulfilled' && ledgerRes.value.success) {
        setLedger(extractArray(ledgerRes.value.data));
      }

      if (tradesRes.status === 'fulfilled' && tradesRes.value.success) {
        const trades = extractArray(tradesRes.value.data);
        const active = trades.filter((t: { status: string }) =>
          ['initiated', 'escrowed', 'confirmed'].includes(t.status)
        );
        const inEscrow = active.filter((t: { status: string }) => t.status === 'escrowed').length;
        const confirming = active.filter((t: { status: string }) => t.status === 'confirmed').length;
        const completed = trades.filter((t: { status: string }) => t.status === 'completed').length;
        const successRate = trades.length > 0 ? Math.round((completed / trades.length) * 100) : 0;
        setStats((prev) => ({
          ...prev,
          activeTrades: active.length,
          tradesInEscrow: inEscrow,
          tradesConfirming: confirming,
          tradeSuccessRate: successRate,
        }));
      }

      const received = bidsRecRes.status === 'fulfilled' && bidsRecRes.value.success ? extractArray(bidsRecRes.value.data).length : 0;
      const sent = bidsSentRes.status === 'fulfilled' && bidsSentRes.value.success ? extractArray(bidsSentRes.value.data).length : 0;
      setStats((prev) => ({
        ...prev,
        pendingBids: received + sent,
        bidsReceived: received,
        bidsSent: sent,
      }));
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Carousel logic ─────────────────────────────────────────────────────────

  const total = WALLET_ORDER.length;

  const goTo = useCallback((i: number) => {
    setCurrent(((i % total) + total) % total);
  }, [total]);

  useEffect(() => {
    if (isDraggingRef.current) return;
    const timer = setInterval(() => {
      goTo(current + 1);
    }, 7000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    carouselRef.current?.classList.add('dragging');
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    if (Math.abs(e.clientX - startXRef.current) > 4) movedRef.current = true;
  }, []);

  const onMouseUp = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    carouselRef.current?.classList.remove('dragging');
    if (!movedRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (dx < -40) goTo(current + 1);
    else if (dx > 40) goTo(current - 1);
  }, [current, goTo]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    movedRef.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (Math.abs(e.touches[0].clientX - startXRef.current) > 4) movedRef.current = true;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!movedRef.current) return;
    const dx = e.changedTouches[0].clientX - startXRef.current;
    if (dx < -40) goTo(current + 1);
    else if (dx > 40) goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Navigation handlers ────────────────────────────────────────────────────

  function handleBuy(currency: string) {
    if (currency === 'NGN') {
      navigate('/dashboard/deposits');
    } else {
      navigate('/dashboard/marketplace?type=SELL&currency=' + currency);
    }
  }

  function handleSell(currency: string) {
    navigate('/dashboard/marketplace?type=BUY&currency=' + currency);
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const orderedWallets = WALLET_ORDER.map(
    (cur) => wallets.find((w) => w.currency === cur) ?? {
      id: cur,
      currency: cur,
      balance: '0.00',
      locked_balance: '0.00',
      escrow_balance: '0.00',
    }
  );

  function getRateForPair(pair: string): Rate | undefined {
    return rates.find((r) => r.pair === pair || r.pair === pair.replace('/', '_'));
  }

  const firstName = user?.name ?? 'there';
 const pinSet = Boolean(user?.transaction_pin_set);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{ padding: "32px 32px 60px", maxWidth: 1080, margin: "0 auto" }}
    >
      {!pinSet && (
        <div
          style={{
            marginBottom: 24,
            padding: "16px 20px",
            borderRadius: 20,
            background: "#fff7e6",
            border: "1px solid #fde68a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, marginBottom: 4, color: "#92400e" }}>
              Transaction PIN required
            </div>
            <div style={{ color: "#6b7280", fontSize: 14 }}>
              Set your PIN to place bids and initiate trades securely.
            </div>
          </div>
          <button
            className="wbtn wbtn-buy"
            style={{
              width: "auto",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
            }}
            onClick={() => navigate("/dashboard/transaction-pin")}
          >
            Set Transaction PIN
          </button>
        </div>
      )}
      <div className="db-welcome">
        <h1>
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="db-welcome-sub">
          Here's your financial overview for today.
        </p>
      </div>

      <div className="db-stat-grid">
        <div className="db-stat">
          <div className="db-stat-label">Total Balance</div>
          {loading ? (
            <div
              className="db-skeleton"
              style={{ height: 36, width: 140, marginBottom: 8 }}
            />
          ) : (
            <div className="db-stat-val">
              ₦
              {stats.totalBalanceNGN.toLocaleString("en-US", {
                minimumFractionDigits: 0,
              })}
            </div>
          )}
          <span className="db-stat-change db-ch-lime">▲ 12.4% this month</span>
        </div>
        <div className="db-stat">
          <div className="db-stat-label">Active Trades</div>
          {loading ? (
            <div
              className="db-skeleton"
              style={{ height: 36, width: 60, marginBottom: 8 }}
            />
          ) : (
            <div className="db-stat-val db-stat-val-white">
              {stats.activeTrades}
            </div>
          )}
          <span className="db-stat-change db-ch-neu">
            {stats.tradesInEscrow} in escrow · {stats.tradesConfirming}{" "}
            confirming
          </span>
        </div>
        <div className="db-stat">
          <div className="db-stat-label">Pending Bids</div>
          {loading ? (
            <div
              className="db-skeleton"
              style={{ height: 36, width: 60, marginBottom: 8 }}
            />
          ) : (
            <div className="db-stat-val db-stat-val-white">
              {stats.pendingBids}
            </div>
          )}
          <span className="db-stat-change db-ch-amb">
            {stats.bidsReceived} received · {stats.bidsSent} sent
          </span>
        </div>
        <div className="db-stat">
          <div className="db-stat-label">Trade Success Rate</div>
          {loading ? (
            <div
              className="db-skeleton"
              style={{ height: 36, width: 100, marginBottom: 8 }}
            />
          ) : (
            <div className="db-stat-val">{stats.tradeSuccessRate}%</div>
          )}
          <span className="db-stat-change db-ch-lime">
            ▲ 2.1% vs last month
          </span>
        </div>
      </div>

      <div className="db-wallet-section">
        <div
          className="db-wallet-carousel"
          ref={carouselRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="db-wallet-track"
            style={{ transform: `translateX(-${current * 25}%)` }}
          >
            {orderedWallets.map((wallet) => (
              <WalletCard
                key={wallet.currency}
                wallet={wallet}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            ))}
          </div>
        </div>

        <div className="db-wallet-nav">
          <button
            className="db-wnav-btn"
            onClick={() => goTo(current - 1)}
            aria-label="Previous wallet"
          >
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
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="db-wallet-dots">
            {WALLET_ORDER.map((_, i) => (
              <button
                key={i}
                className={`db-dot${i === current ? " active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to wallet ${i + 1}`}
              />
            ))}
          </div>
          <button
            className="db-wnav-btn"
            onClick={() => goTo(current + 1)}
            aria-label="Next wallet"
          >
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
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="db-rates-card">
        <div className="db-rates-header">
          <div className="db-rates-title">
            Live Market Rates
            <span className="db-rates-badge">Live</span>
          </div>
          <div className="db-live-badge">
            <div className="db-live-dot" />
            {ratesUpdatedAt ? `Updated ${ratesUpdatedAt}` : "Updating…"}
          </div>
        </div>
        <div className="db-rates-strip">
          {loading
            ? RATE_PAIRS.map((p) => (
                <div key={p.pair} className="rate-item">
                  <div className="db-skeleton" style={{ height: 120 }} />
                </div>
              ))
            : RATE_PAIRS.map((cfg) => (
                <RateCard
                  key={cfg.pair}
                  config={cfg}
                  rate={getRateForPair(cfg.pair)}
                />
              ))}
        </div>
      </div>

      <div className="db-txn-card">
        <div className="db-section-head">
          <span className="db-section-title">Recent Transactions</span>
          <button
            className="db-view-all"
            onClick={() => navigate("/dashboard/history")}
          >
            View all ↗
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="db-skeleton"
                style={{ height: 48, borderRadius: 10 }}
              />
            ))}
          </div>
        ) : ledger.length === 0 ? (
          <div className="db-empty">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink3)"
              strokeWidth="1.5"
            >
              <rect x="2" y="3" width="20" height="18" rx="3" />
              <path d="M7 8h10M7 12h6" />
            </svg>
            No transactions yet. Start trading or fund your wallet.
          </div>
        ) : (
          <table className="db-txn">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Type</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ledger.slice(0, 5).map((entry) => {
                const initials = getInitials(entry.reference);
                const avatarColors: Record<
                  string,
                  { bg: string; color: string }
                > = {
                  deposit: { bg: "var(--blue-bg)", color: "var(--blue)" },
                  trade_credit: {
                    bg: "var(--green-bg)",
                    color: "var(--green)",
                  },
                  trade_debit: { bg: "var(--amber-bg)", color: "var(--amber)" },
                  withdrawal: { bg: "var(--red-bg)", color: "var(--red)" },
                };
                const avColor = avatarColors[entry.type] ?? {
                  bg: "var(--lime-faint)",
                  color: "var(--lime-d)",
                };
                return (
                  <tr key={entry.id}>
                    <td>
                      <div className="db-user-cell">
                        <div
                          className="db-mini-av"
                          style={{
                            background: avColor.bg,
                            color: avColor.color,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="db-cell-name">
                            {getTxnType(entry.type)}
                          </div>
                          <div className="db-cell-sub">#{entry.reference}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${getTxnPillClass(entry.type)}`}>
                        {getTxnType(entry.type)}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {entry.currency}
                      </span>
                    </td>
                    <td>
                      <span className={`amt ${getAmtClass(entry.type)}`}>
                        {formatTxnAmount(entry)}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink3)", fontSize: 12 }}>
                      {(entry as any).rate ? `₦${(entry as any).rate}` : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${getStatusClass(entry.status)}`}
                      >
                        {getStatusLabel(entry.status)}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink4)", fontSize: 12 }}>
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}