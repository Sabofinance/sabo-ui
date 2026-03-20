import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../assets/css/SabitMarketPage.css';
import { ratesApi, sabitsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create a Sabit listing',
    desc: 'Post how much currency you want to buy or sell, set your rate, and go live on the marketplace instantly.',
  },
  {
    step: '02',
    title: 'Find your match',
    desc: 'Browse real listings from verified traders. Filter by currency pair, rate, and payment method.',
  },
  {
    step: '03',
    title: 'Trade peer-to-peer',
    desc: 'Agree on terms, confirm payment, and funds are transferred directly — no middleman, no hidden fees.',
  },
  {
    step: '04',
    title: 'Rate your trader',
    desc: 'After every trade, leave a review. Our reputation system keeps the marketplace honest and safe.',
  },
];

const CURRENCIES = [
  { from: 'NGN', to: 'GBP', flag1: 'https://flagcdn.com/w40/ng.png', flag2: 'https://flagcdn.com/w40/gb.png', label: 'per £1' },
  { from: 'NGN', to: 'USD', flag1: 'https://flagcdn.com/w40/ng.png', flag2: 'https://flagcdn.com/w40/us.png', label: 'per $1' },
  { from: 'NGN', to: 'CAD', flag1: 'https://flagcdn.com/w40/ng.png', flag2: 'https://flagcdn.com/w40/ca.png', label: 'per CA$1' },
  { from: 'GBP', to: 'USD', flag1: 'https://flagcdn.com/w40/gb.png', flag2: 'https://flagcdn.com/w40/us.png', label: 'per £1' },
];

const TRUST_POINTS = [
  { icon: '🔒', title: 'Escrow protected',     desc: 'Funds are held securely until both parties confirm the trade is complete.' },
  { icon: '✅', title: 'Verified traders',      desc: 'Every trader completes identity verification before going live on the market.' },
  { icon: '⚡', title: 'Instant settlement',    desc: 'Most trades complete in under 10 minutes — faster than any bank wire.' },
  { icon: '💬', title: 'In-app dispute chat',   desc: 'Our team mediates any dispute directly inside the platform, 24/7.' },
];

const SabitMarketPage = () => {
  const { isAuthenticated } = useAuth();
  const [pairRates, setPairRates] = useState<Record<string, string>>({});
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterCurrency, setFilterCurrency] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [ratesResList, listingsRes] = await Promise.all([
          Promise.all(
            CURRENCIES.map(async (c) => {
              const res = await ratesApi.getByPair(c.from, c.to);
              if (!res.success) return [c.from + '_' + c.to, '—'] as const;
              const d = res.data as any;
              const v = Number(d?.rate ?? d?.value ?? 0);
              const formatted = v ? String(v) : '—';
              return [c.from + '_' + c.to, formatted] as const;
            }),
          ),
          sabitsApi.list({ status: 'active' }),
        ]);

        const nextRates: Record<string, string> = {};
        for (const [key, value] of ratesResList) nextRates[key] = value;
        setPairRates(nextRates);

        if (listingsRes.success && Array.isArray(listingsRes.data)) {
          setListings(listingsRes.data);
        } else if (!listingsRes.success) {
          setError(listingsRes.error?.message || 'Failed to load marketplace listings');
        }
      } catch (err: any) {
        setError('Failed to load marketplace data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const formattedListings = useMemo(() => {
    return listings
      .map((item: Record<string, unknown>, idx: number) => {
        const seller = item.seller as any;
        const id = Number(item.id || item.sabitId || idx + 1);
        const type = String(item.type || (item.side as string) || 'sell').toLowerCase() === 'buy' ? 'buy' : 'sell';
        const badge = type === 'sell' ? 'SELL' : 'BUY';
        const currency = String(item.currency || 'GBP');
        const amount = Number(item.amount || 0);
        const rate = Number(item.rate || 0);
        const sellerName = String(item.sellerName || seller?.name || item.name || 'Verified Trader');
        const avatar = String(item.sellerAvatar || seller?.avatar || item.avatar || `https://i.pravatar.cc/150?u=${sellerName}`);
        const trades = Number(item.completedTrades || item.completed || 0);
        const rating = Number(item.rating || seller?.rating || 0);

        return {
          id,
          type,
          badge,
          currency,
          amount,
          rate,
          sellerName,
          avatar,
          trades,
          rating,
          raw: item,
        };
      })
      .filter((item) => {
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesCurrency = filterCurrency === 'all' || item.currency === filterCurrency;
        return matchesType && matchesCurrency;
      });
  }, [listings, filterType, filterCurrency]);        id,
        name: sellerName,
        avatar,
        badge,
        sell: currency && amount ? `${currency} ${amount}` : '',
        rate: rate && currency ? `₦${rate}/${currency}` : '—',
        trades,
        rating,
      };
    });
  }, [listings]);

  return (
    <div className="smp-page">
      <Header />

      {/* ── HERO ── */}
      <section className="smp-hero">
        <div className="smp-hero-badge">Peer-to-Peer Currency Exchange</div>
        <h1 className="smp-hero-title">
          Trade currency directly<br />with real people
        </h1>
        <p className="smp-hero-sub">
          Sabit Marketplace connects Africans in the diaspora with trusted traders
          at home — cutting out banks and getting you the best possible rate.
        </p>
        <div className="smp-hero-cta">
          <Link to="/signup" className="smp-btn-primary">Start Trading Free</Link>
          <Link to="/login"  className="smp-btn-ghost">View Live Market</Link>
        </div>

        {/* Live rate pills */}
        <div className="smp-rate-pills">
          {CURRENCIES.map(c => (
            <div className="smp-rate-pill" key={`${c.from}-${c.to}`}>
              <div className="smp-pill-flags">
                <img src={c.flag1} alt={c.from} />
                <img src={c.flag2} alt={c.to} className="overlap" />
              </div>
              <span className="smp-pill-pair">{c.from} → {c.to}</span>
              <span className="smp-pill-rate">
                {pairRates[c.from + '_' + c.to] || '—'}
              </span>
              <span className="smp-pill-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MOCK LISTINGS ── */}
      <section className="smp-listings-section">
        <div className="smp-container">
          <div className="smp-section-head">
            <div className="smp-section-title-group">
              <h2>Live Marketplace</h2>
              <span className="smp-live-dot">
                ● Live · {formattedListings.length} listings
              </span>
            </div>
            <div className="market-filters">
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-tab ${filterType === 'buy' ? 'active' : ''}`}
                  onClick={() => setFilterType('buy')}
                >
                  Buy
                </button>
                <button 
                  className={`filter-tab ${filterType === 'sell' ? 'active' : ''}`}
                  onClick={() => setFilterType('sell')}
                >
                  Sell
                </button>
              </div>
              <select 
                className="currency-filter"
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
              >
                <option value="all">All Currencies</option>
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CAD">CAD (CA$)</option>
              </select>
            </div>
          </div>
          <div className="smp-table-wrap">
            <table className="smp-table">
              <thead>
                <tr>
                  <th>Trader</th>
                  <th>Type</th>
                  <th>Offering</th>
                  <th>Rate</th>
                  <th>Reputation</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6}>Loading listings...</td>
                  </tr>
                )}
                {!loading && formattedListings.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div className="smp-trader-cell">
                        <img src={l.avatar} alt={l.name} className="smp-avatar" />
                        <span className="smp-trader-name">{l.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`smp-badge ${l.badge === 'SELL' ? 'sell' : 'buy'}`}>
                        {l.badge} SABIT
                      </span>
                    </td>
                    <td className="smp-offering">{l.sell}</td>
                    <td className="smp-rate">{l.rate}</td>
                    <td>
                      <div className="smp-rep">
                        <span className="smp-stars">★ {l.rating}</span>
                        <span className="smp-trades">{l.trades} trades</span>
                      </div>
                    </td>
                    <td>
                      <Link
                        to={isAuthenticated ? `/dashboard/transaction/${l.id}` : '/signup'}
                        className="smp-action-btn"
                      >
                        {l.badge === 'SELL' ? 'Buy' : 'Sell'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && <p style={{ marginTop: '1rem', color: 'red' }}>{error}</p>}
          <div className="smp-table-cta">
            <Link to="/signup" className="smp-btn-primary">See all listings →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="smp-how-section">
        <div className="smp-container">
          <h2 className="smp-section-title">How Sabit works</h2>
          <p className="smp-section-sub">Four simple steps from listing to settlement.</p>
          <div className="smp-steps-grid">
            {HOW_IT_WORKS.map(s => (
              <div className="smp-step-card" key={s.step}>
                <div className="smp-step-num">{s.step}</div>
                <h3 className="smp-step-title">{s.title}</h3>
                <p className="smp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="smp-trust-section">
        <div className="smp-container">
          <h2 className="smp-section-title">Built on trust</h2>
          <p className="smp-section-sub">Every trade is protected from start to finish.</p>
          <div className="smp-trust-grid">
            {TRUST_POINTS.map(t => (
              <div className="smp-trust-card" key={t.title}>
                <div className="smp-trust-icon">{t.icon}</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="smp-cta-banner">
        <div className="smp-container">
          <h2>Ready to get a better rate?</h2>
          <p>Join thousands of Africans already trading on Sabo.</p>
          <Link to="/signup" className="smp-btn-dark">Create free account</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SabitMarketPage;