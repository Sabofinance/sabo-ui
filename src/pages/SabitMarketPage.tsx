import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../assets/css/SabitMarketPage.css';

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
  { from: 'NGN', to: 'GBP', flag1: 'https://flagcdn.com/w40/ng.png', flag2: 'https://flagcdn.com/w40/gb.png', rate: '₦1,650', label: 'per £1' },
  { from: 'NGN', to: 'USD', flag1: 'https://flagcdn.com/w40/ng.png', flag2: 'https://flagcdn.com/w40/us.png', rate: '₦1,300', label: 'per $1' },
  { from: 'NGN', to: 'CAD', flag1: 'https://flagcdn.com/w40/ng.png', flag2: 'https://flagcdn.com/w40/ca.png', rate: '₦960',   label: 'per CA$1' },
  { from: 'GBP', to: 'USD', flag1: 'https://flagcdn.com/w40/gb.png', flag2: 'https://flagcdn.com/w40/us.png', rate: '$1.27',  label: 'per £1' },
];

const MOCK_LISTINGS = [
  { id: 1, name: 'Sarah.eth',   avatar: 'https://i.pravatar.cc/150?u=10', sell: '£500 GBP',  rate: '₦1,650/£1', badge: 'SELL', trades: 312, rating: 4.9 },
  { id: 2, name: 'TobiOluwole', avatar: 'https://i.pravatar.cc/150?u=11', sell: '₦820,000',  rate: '₦1,640/£1', badge: 'BUY',  trades: 89,  rating: 4.7 },
  { id: 3, name: 'EmmaTrades',  avatar: 'https://i.pravatar.cc/150?u=12', sell: '$300 USD',   rate: '₦1,295/$1', badge: 'SELL', trades: 203, rating: 5.0 },
  { id: 4, name: 'DiasporaKing',avatar: 'https://i.pravatar.cc/150?u=13', sell: 'CA$200',     rate: '₦955/CA$1', badge: 'SELL', trades: 57,  rating: 4.8 },
];

const TRUST_POINTS = [
  { icon: '🔒', title: 'Escrow protected',     desc: 'Funds are held securely until both parties confirm the trade is complete.' },
  { icon: '✅', title: 'Verified traders',      desc: 'Every trader completes identity verification before going live on the market.' },
  { icon: '⚡', title: 'Instant settlement',    desc: 'Most trades complete in under 10 minutes — faster than any bank wire.' },
  { icon: '💬', title: 'In-app dispute chat',   desc: 'Our team mediates any dispute directly inside the platform, 24/7.' },
];

const SabitMarketPage = () => {
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
              <span className="smp-pill-rate">{c.rate}</span>
              <span className="smp-pill-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MOCK LISTINGS ── */}
      <section className="smp-listings-section">
        <div className="smp-container">
          <div className="smp-section-head">
            <h2>Live Marketplace</h2>
            <span className="smp-live-dot">● Live · {MOCK_LISTINGS.length} listings</span>
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
                {MOCK_LISTINGS.map(l => (
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
                      <Link to="/signup" className="smp-action-btn">
                        {l.badge === 'SELL' ? 'Buy' : 'Sell'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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