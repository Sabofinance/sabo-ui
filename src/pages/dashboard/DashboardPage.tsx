import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellModal from '../../components/SellModal';
import ActivityChart, { type ActivityChartPoint } from '../../components/ActivityChart';
import TransactionHistory, { type TransactionItem } from '../../components/TransactionHistory';
import { ledgerApi, ratesApi, sabitsApi, walletsApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/DashboardPage.css';

type WalletView = {
  id: string;
  currency: string;
  balance: number;
  symbol: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  income: number;
  outcome: number;
  limit: number;
};

type SellerView = {
  id: number;
  name: string;
  avatar: string;
  amount: number;
  currency: string;
  rate: number;
  rating: number;
  completed: number;
  type: 'buy' | 'sell';
};

/* ── Flag image URLs — reliable across all platforms ── */
const FLAG_URLS: Record<string, string> = {
  NGN: 'https://flagcdn.com/w80/ng.png',
  GBP: 'https://flagcdn.com/w80/gb.png',
  USD: 'https://flagcdn.com/w80/us.png',
  EUR: 'https://flagcdn.com/w80/eu.png',
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeWalletIndex, setActiveWalletIndex] = useState(0);
  const [wallets, setWallets] = useState<WalletView[]>([]);
  const [marketListings, setMarketListings] = useState<SellerView[]>([]);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activityPoints, setActivityPoints] = useState<ActivityChartPoint[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');

  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState('');
  const [tradingStats, setTradingStats] = useState<
    { label: string; pct: number; cls: string }[]
  >([]);
  const [rateHistoryValues, setRateHistoryValues] = useState<number[]>([]);
  const [isSellModalOpen,   setIsSellModalOpen]   = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [walletRes, listingRes, ratesRes] = await Promise.all([
          walletsApi.list(),
          sabitsApi.list({ status: "active", limit: 6 }),
          ratesApi.getByPair("NGN", "GBP"),
        ]);

        if (walletRes.success && Array.isArray(walletRes.data)) {
          setWallets(
            walletRes.data.map((w: Record<string, unknown>, index: number) => ({
              id: String(w.id || w.currency || index),
              currency: String(w.currency || "NGN"),
              balance: Number(w.balance || 0),
              symbol: String(w.symbol || (w.currency === "GBP" ? "£" : "₦")),
              cardNumber: String(w.cardNumber || ''),
              cardHolder: String(w.cardHolder || ''),
              expiry: String(w.expiry || ''),
              income: Number(w.income || 0),
              outcome: Number(w.outcome || 0),
              limit: Number(w.limit || 0),
            })),
          );
        } else if (!walletRes.success) {
          setError(walletRes.error?.message || 'Failed to load wallets');
        }

        if (listingRes.success && Array.isArray(listingRes.data)) {
          setMarketListings(
            listingRes.data.map((item: Record<string, unknown>, index: number) => ({
              id: Number(item.id || index + 1),
              name: String(item.sellerName || item.name || ''),
              avatar: String(item.avatar || ''),
              amount: Number(item.amount || 0),
              currency: String(item.currency || "NGN"),
              rate: Number(item.rate || 0),
              rating: Number(item.rating || 0),
              completed: Number(item.completed || 0),
              type: item.type === "sell" ? "sell" : "buy",
            })),
          );
        } else if (!listingRes.success) {
          setError(listingRes.error?.message || 'Failed to load marketplace listings');
        }

        if (ratesRes.success && ratesRes.data && typeof ratesRes.data === "object") {
          const typed = ratesRes.data as Record<string, unknown>;
          setRate(Number(typed.rate || typed.value || 0));
        }

        setActivityLoading(true);
        setActivityError('');
        setRecentLoading(true);
        setRecentError('');

        const [ledgerRes, rateHistoryRes] = await Promise.all([
          ledgerApi.listEntries({ limit: 50 }),
          ratesApi.list({ base: 'NGN', quote: 'GBP', range: '7d' }),
        ]);

        if (ledgerRes.success && Array.isArray(ledgerRes.data)) {
          const allMapped = ledgerRes.data.map((entry: Record<string, unknown>, idx: number) => {
            const counterparty =
              (entry.counterpartyName as string | undefined) ||
              (entry.counterparty as any)?.name ||
              '';
            const avatar =
              (entry.counterpartyAvatar as string | undefined) ||
              (entry.counterparty as any)?.avatar ||
              '';

            const typeRaw = String(entry.type || 'buy');
            const type: TransactionItem['type'] = typeRaw === 'sell' ? 'sell' : 'buy';

            const statusRaw = String(entry.status || 'completed');
            const status: TransactionItem['status'] =
              statusRaw === 'pending' || statusRaw === 'cancelled' || statusRaw === 'completed'
                ? (statusRaw as TransactionItem['status'])
                : 'completed';

            const currency = String(entry.currency || '');
            const total = Number(entry.total || entry.value || 0);
            const amount = Number(entry.amount || 0);
            const rateValue = Number(entry.rate || entry.exchangeRate || 0);

            return {
              id: Number(entry.id || idx + 1),
              type,
              currency,
              amount,
              rate: rateValue,
              total: total || (amount * rateValue),
              counterparty,
              avatar,
              date: String(entry.date || entry.createdAt || new Date().toISOString()),
              status,
            };
          });

          setRecentTransactions(allMapped.slice(0, 3));

          // Compute chart points from ledger entries (only completed transactions)
          const now = new Date();
          const dayMs = 24 * 60 * 60 * 1000;
          const dayBuckets = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now.getTime() - (6 - i) * dayMs);
            const start = new Date(d.toDateString()).getTime();
            const end = start + dayMs;
            const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
            return { start, end, label, trades: 0, volume: 0 };
          });

          for (const tx of allMapped) {
            if (tx.status !== 'completed') continue;
            const t = new Date(tx.date).getTime();
            if (!Number.isFinite(t)) continue;
            const bucket = dayBuckets.find((b) => t >= b.start && t < b.end);
            if (!bucket) continue;
            bucket.trades += 1;
            bucket.volume += tx.total || 0;
          }
          setActivityPoints(dayBuckets.map(b => ({ day: b.label, trades: b.trades, volume: b.volume })));

          // Derive trading stats (Buy vs Sell volume)
          const buyVol = allMapped.filter(t => t.type === 'buy' && t.status === 'completed').reduce((s, t) => s + t.total, 0);
          const sellVol = allMapped.filter(t => t.type === 'sell' && t.status === 'completed').reduce((s, t) => s + t.total, 0);
          const totalVol = buyVol + sellVol;

          setTradingStats([
            { 
              label: 'Buying Volume', 
              pct: totalVol > 0 ? (buyVol / totalVol) * 100 : 0, 
              cls: 'buy-bar' 
            },
            { 
              label: 'Selling Volume', 
              pct: totalVol > 0 ? (sellVol / totalVol) * 100 : 0, 
              cls: 'sell-bar' 
            }
          ]);
        } else if (!ledgerRes.success) {
          setRecentError(ledgerRes.error?.message || 'Failed to load transactions');
          setActivityError(ledgerRes.error?.message || 'Failed to load activity');
        }

        // Exchange rate history chart (best-effort mapping)
        if (rateHistoryRes.success && Array.isArray(rateHistoryRes.data)) {
          const values = rateHistoryRes.data
            .map((x: Record<string, unknown>) => {
              const v = Number(x.rate ?? x.value ?? x.exchangeRate ?? 0);
              const date = String(x.date || x.createdAt || '');
              return { v, date };
            })
            .filter((x) => Number.isFinite(x.v) && x.v > 0);

          values.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
          const lastValues = values.map((x) => x.v).slice(-10);
          setRateHistoryValues(lastValues);
        } else {
          setRateHistoryValues([]);
        }
      } catch (err: any) {
        setError('An unexpected error occurred while loading dashboard data');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
        setActivityLoading(false);
        setRecentLoading(false);
      }
    };
    void load();
  }, []);

  const activeWallet = wallets[activeWalletIndex];
  const nextWallet   = () => setActiveWalletIndex((prev) => (wallets.length ? (prev + 1) % wallets.length : 0));
  const prevWallet   = () => setActiveWalletIndex((prev) => (wallets.length ? (prev - 1 + wallets.length) % wallets.length : 0));

  const handleSellSubmit       = (amount: number, rate: number) =>
    console.log(`Listing Sabit: ${amount} ${activeWallet.currency} at ₦${rate}/1 ${activeWallet.currency}`);
  const handleBuyClick         = () => navigate('/dashboard/active-sabits');
  const handleViewAllHistory   = () => navigate('/dashboard/history');

  const formatNumber     = (num: number) => new Intl.NumberFormat('en-NG').format(num);
  const getCurrencySymbol = (c: string)  => c === 'NGN' ? '₦' : c === 'GBP' ? '£' : '';
  const displayRate = useMemo(() => rate ?? null, [rate]);

  const rateChangePct = useMemo(() => {
    if (rateHistoryValues.length < 2) return null;
    const first = rateHistoryValues[0];
    const last = rateHistoryValues[rateHistoryValues.length - 1];
    if (!first || !Number.isFinite(first) || !Number.isFinite(last)) return null;
    return ((last - first) / first) * 100;
  }, [rateHistoryValues]);

  const rateSparklinePoints = useMemo(() => {
    const values = rateHistoryValues;
    if (values.length < 2) return '';

    const width = 100;
    const height = 40;
    const padding = 6;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - padding - ((v - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [rateHistoryValues]);

  if (loading) {
    return <main className="dashboard-padding"><p>Loading dashboard...</p></main>;
  }
  if (error) {
    return <main className="dashboard-padding"><p>{error}</p></main>;
  }
  if (!activeWallet) {
    return <main className="dashboard-padding"><p>No wallet data available.</p></main>;
  }

  return (
    <>
      <main className="dashboard-padding">

            {/* Welcome */}
            <div className="welcome-message">
              <h1>
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
              </h1>
              <p>Get summary of your weekly online transactions here.</p>
            </div>

            <div className="dashboard-grid">

              {/* ════ LEFT COLUMN ════ */}
              <div className="left-column">

                {/* WALLET CARD */}
                <section className="card-display-container">
                  <div className={`sabo-glass-card ${activeWallet.id}`}>

                    <button className="card-arrow left" onClick={prevWallet} aria-label="Previous wallet">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <div className="card-visual">
                      <div className="cloud-effect cloud-1" />
                      <div className="cloud-effect cloud-2" />
                      <div className="cloud-effect cloud-3" />
                      <div className="glow-effect" />

                      <div className="card-header-row">
                        <div className="card-brand">sabo</div>
                        <div className="card-chip">
                          <div className="chip-line" />
                          <div className="chip-line" />
                          <div className="chip-dot" />
                        </div>
                      </div>

                      <div className="card-number">{activeWallet.cardNumber}</div>

                      <div className="card-holder-row">
                        <div className="info-group">
                          <small>Card holder</small>
                          <p>{activeWallet.cardHolder}</p>
                        </div>
                        <div className="info-group">
                          <small>Expiry date</small>
                          <p>{activeWallet.expiry}</p>
                        </div>
                      </div>

                      <div className="card-pattern" />
                      <div className="card-shine" />
                    </div>

                    <div className="card-data">
                      <div className="balance-box">
                        <h2 className="balance-amount">
                          {activeWallet.symbol}{formatNumber(activeWallet.balance)}
                        </h2>
                        <small>Current balance</small>
                      </div>

                      <div className="mini-stats">
                        <div className="stat income">
                          <span className="val">{activeWallet.symbol}{formatNumber(activeWallet.income)}</span>
                          <small>Income</small>
                        </div>
                        <div className="stat outcome">
                          <span className="val">{activeWallet.symbol}{formatNumber(activeWallet.outcome)}</span>
                          <small>Outcome</small>
                        </div>
                      </div>

                      <div className="card-actions-row">
                        <button className="btn-sell" onClick={() => setIsSellModalOpen(true)}>
                          SELL {activeWallet.currency}
                        </button>
                        <button className="btn-buy-small" onClick={handleBuyClick}>
                          BUY {activeWallet.currency}
                        </button>
                      </div>
                    </div>

                    <button className="card-arrow right" onClick={nextWallet} aria-label="Next wallet">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </section>

                {/* MARKETPLACE */}
                <section className="marketplace-section">
                  <div className="section-header">
                    <h3>Active Sabit Marketplace</h3>
                    <span className="filter-badge">Live • {marketListings.length} listings</span>
                  </div>
                  <div className="table-responsive">
                    <table className="sabit-table">
                      <thead>
                        <tr>
                          <th>Seller</th>
                          <th>Type</th>
                          <th>Rate (NGN)</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketListings.map(seller => (
                          <tr key={seller.id}>
                            <td>
                              <div className="seller-cell">
                                <img src={seller.avatar} alt={seller.name} className="avatar-sm" />
                                <span className="seller-name">{seller.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="type-tag">
                                {seller.type === 'sell' ? 'SELL SABIT' : 'BUY SABIT'}
                              </span>
                            </td>
                            <td><span className="rate-amount">₦{formatNumber(seller.rate)}</span></td>
                            <td>
                              <span className="currency-badge">
                                {getCurrencySymbol(seller.currency)}{formatNumber(seller.amount)} {seller.currency}
                              </span>
                            </td>
                            <td className="action-cell">
                              <button
                                className={`action-btn ${seller.type === 'sell' ? 'btn-buy-market' : 'btn-sell-market'}`}
                                onClick={() => console.log(`Action: ${seller.name}`)}
                              >
                                {seller.type === 'sell' ? 'Buy' : 'Sell'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* TRANSACTION HISTORY */}
                <TransactionHistory
                  onViewAll={handleViewAllHistory}
                  transactions={recentTransactions}
                  loading={recentLoading}
                  error={recentError}
                />
              </div>

              {/* ════ RIGHT COLUMN ════ */}
              <div className="right-column">

                {/* Trading stats */}
                <div className="utility-card">
                  <h3>Trading Statistics</h3>
                  <div className="stat-bar-group">
                    {tradingStats.length ? (
                      tradingStats.map((bar) => (
                        <div className="bar-item" key={bar.cls}>
                          <div className="bar-label">
                            <span>{bar.label}</span>
                            <span>{bar.pct}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className={`bar-fill ${bar.cls}`} style={{ width: `${bar.pct}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#64748B', marginTop: '8px' }}>No trading statistics yet.</p>
                    )}
                  </div>
                </div>

                {/* Exchange Rate Card */}
                <div className="utility-card exchange-rate-card">
                  <h4>Exchange Rate</h4>
                  <div className="exchange-rate-visual">

                    {/* Sparkline chart */}
                    <div className="mini-chart">
                      {rateSparklinePoints ? (
                        <svg viewBox="0 0 100 40" className="rate-chart" preserveAspectRatio="none">
                          <polyline
                            points={rateSparklinePoints}
                            stroke="#C8F032"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <p style={{ color: '#64748B', margin: 0 }}>No rate history</p>
                      )}
                    </div>

                    {/* Rate pair cards — using real flag images */}
                    <div className="rate-cards">

                      {/* NGN → GBP */}
                      <div className="rate-card-item">
                        <div className="rate-pair">
                          <div className="rate-flag-wrap">
                            <img
                              src={FLAG_URLS.NGN}
                              alt="Nigeria"
                              className="rate-flag-img"
                              loading="lazy"
                            />
                          </div>
                          <div className="rate-flag-wrap rate-flag-wrap--overlap">
                            <img
                              src={FLAG_URLS.GBP}
                              alt="United Kingdom"
                              className="rate-flag-img"
                              loading="lazy"
                            />
                          </div>
                          <span className="pair-text">NGN → GBP</span>
                        </div>
                        <div className="rate-value-large">
                          {displayRate === null ? '—' : `₦${formatNumber(displayRate)}`}
                        </div>
                        <div className="rate-sub">per £1</div>
                      </div>

                      {/* GBP → NGN */}
                      <div className="rate-card-item">
                        <div className="rate-pair">
                          <div className="rate-flag-wrap">
                            <img
                              src={FLAG_URLS.GBP}
                              alt="United Kingdom"
                              className="rate-flag-img"
                              loading="lazy"
                            />
                          </div>
                          <div className="rate-flag-wrap rate-flag-wrap--overlap">
                            <img
                              src={FLAG_URLS.NGN}
                              alt="Nigeria"
                              className="rate-flag-img"
                              loading="lazy"
                            />
                          </div>
                          <span className="pair-text">GBP → NGN</span>
                        </div>
                        <div className="rate-value-large">
                          {displayRate === null ? '—' : `₦${formatNumber(displayRate)}`}
                        </div>
                        <div className="rate-sub">per £1</div>
                      </div>

                    </div>

                    {/* Change indicator */}
                    <div className="rate-change-indicator">
                      <div className="change-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 15l7-7 7 7"/>
                        </svg>
                        <span>+2.4%</span>
                      </div>
                      <span className="change-text">from yesterday</span>
                    </div>

                  </div>
                </div>

                <ActivityChart
                  points={activityPoints}
                  loading={activityLoading}
                  error={activityError}
                />
              </div>
            </div>
          </main>

          {isSellModalOpen && (
            <SellModal
              currency={activeWallet.currency}
              balance={activeWallet.balance}
              symbol={activeWallet.symbol}
              onClose={() => setIsSellModalOpen(false)}
              onSubmit={handleSellSubmit}
            />
          )}
        </>

  );
};

export default DashboardPage;