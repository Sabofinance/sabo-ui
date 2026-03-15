import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../assets/css/SaboBusinessPage.css';

const FEATURES = [
  { icon: '🏦', title: 'Multi-currency accounts',    desc: 'Hold, send and receive NGN, GBP, USD and CAD under one business account.' },
  { icon: '📊', title: 'Real-time FX dashboard',     desc: 'Monitor your exchange rates, exposure and transaction history at a glance.' },
  { icon: '🔄', title: 'Bulk payment processing',    desc: 'Pay suppliers, staff and partners in multiple currencies in a single batch.' },
  { icon: '🔐', title: 'Role-based access control',  desc: 'Give your finance team the right permissions. Nothing more, nothing less.' },
  { icon: '📋', title: 'Automated reconciliation',   desc: 'Every transaction auto-tagged and ready for your accountant in one click.' },
  { icon: '📱', title: 'API & integrations',         desc: 'Connect Sabo to your ERP, payroll, or e-commerce stack via REST API.' },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    highlight: false,
    perks: [
      '1 multi-currency account',
      'Up to 20 trades/month',
      'Basic FX dashboard',
      'Email support',
    ],
    cta: 'Get started free',
    href: '/signup',
  },
  {
    name: 'Growth',
    price: '£29',
    period: '/mo',
    highlight: true,
    perks: [
      '5 multi-currency accounts',
      'Unlimited trades',
      'Bulk payments',
      'Reconciliation export',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    href: '/signup',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    highlight: false,
    perks: [
      'Unlimited accounts',
      'Dedicated account manager',
      'Custom API limits',
      'SLA guarantee',
      'On-site onboarding',
    ],
    cta: 'Talk to sales',
    href: '/contact',
  },
];

const STEPS = [
  { num: '01', title: 'Register your business',   desc: 'Sign up with your company details and complete a 5-minute KYB process.' },
  { num: '02', title: 'Open currency accounts',   desc: 'Instantly open NGN, GBP, USD and CAD accounts — no paperwork required.' },
  { num: '03', title: 'Fund and start transacting',desc: 'Top up, send bulk payments, or access the Sabit marketplace for better rates.' },
];

const LOGOS = ['Accenture', 'Deloitte', 'Shell', 'MTN', 'Zenith Bank', 'GTB'];

const SaboBusinessPage = () => {
  return (
    <div className="sbp-page">
      <Header />

      {/* ── HERO ── */}
      <section className="sbp-hero">
        <div className="sbp-hero-inner">
          <div className="sbp-hero-text">
            <div className="sbp-hero-badge">For Businesses</div>
            <h1 className="sbp-hero-title">
              Global payments.<br />
              <span>Built for Africa.</span>
            </h1>
            <p className="sbp-hero-sub">
              Sabo for Business gives your company multi-currency accounts,
              competitive FX rates, and bulk payment tools — so you can operate
              across borders without the traditional banking headache.
            </p>
            <div className="sbp-hero-cta">
              <Link to="/signup"  className="sbp-btn-primary">Open a business account</Link>
              <Link to="/contact" className="sbp-btn-ghost">Talk to sales</Link>
            </div>
          </div>

          {/* Stats card */}
          <div className="sbp-hero-card">
            <div className="sbp-stat-grid">
              <div className="sbp-stat">
                <span className="sbp-stat-num">£2.4B+</span>
                <span className="sbp-stat-label">Processed annually</span>
              </div>
              <div className="sbp-stat">
                <span className="sbp-stat-num">4</span>
                <span className="sbp-stat-label">Currencies supported</span>
              </div>
              <div className="sbp-stat">
                <span className="sbp-stat-num">99.9%</span>
                <span className="sbp-stat-label">Uptime SLA</span>
              </div>
              <div className="sbp-stat">
                <span className="sbp-stat-num">&lt;10 min</span>
                <span className="sbp-stat-label">Average settlement</span>
              </div>
            </div>

            <div className="sbp-fx-preview">
              <div className="sbp-fx-row">
                <div className="sbp-fx-pair">
                  <img src="https://flagcdn.com/w40/gb.png" alt="GBP" />
                  <img src="https://flagcdn.com/w40/ng.png" alt="NGN" className="overlap" />
                  <span>GBP / NGN</span>
                </div>
                <span className="sbp-fx-rate">₦1,650.00</span>
                <span className="sbp-fx-change up">+0.8%</span>
              </div>
              <div className="sbp-fx-row">
                <div className="sbp-fx-pair">
                  <img src="https://flagcdn.com/w40/us.png" alt="USD" />
                  <img src="https://flagcdn.com/w40/ng.png" alt="NGN" className="overlap" />
                  <span>USD / NGN</span>
                </div>
                <span className="sbp-fx-rate">₦1,300.00</span>
                <span className="sbp-fx-change up">+0.3%</span>
              </div>
              <div className="sbp-fx-row">
                <div className="sbp-fx-pair">
                  <img src="https://flagcdn.com/w40/ca.png" alt="CAD" />
                  <img src="https://flagcdn.com/w40/ng.png" alt="NGN" className="overlap" />
                  <span>CAD / NGN</span>
                </div>
                <span className="sbp-fx-rate">₦960.00</span>
                <span className="sbp-fx-change down">−0.1%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section className="sbp-trusted">
        <div className="sbp-container">
          <p className="sbp-trusted-label">Trusted by leading African businesses</p>
          <div className="sbp-logo-row">
            {LOGOS.map(l => (
              <div className="sbp-logo-pill" key={l}>{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="sbp-features-section">
        <div className="sbp-container">
          <h2 className="sbp-section-title">Everything your finance team needs</h2>
          <p className="sbp-section-sub">One platform. Every currency tool you need to operate globally.</p>
          <div className="sbp-features-grid">
            {FEATURES.map(f => (
              <div className="sbp-feature-card" key={f.title}>
                <div className="sbp-feature-icon">{f.icon}</div>
                <h3 className="sbp-feature-title">{f.title}</h3>
                <p className="sbp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="sbp-how-section">
        <div className="sbp-container">
          <h2 className="sbp-section-title">Up and running in minutes</h2>
          <p className="sbp-section-sub">No bank appointments. No paperwork piles. Just a few clicks.</p>
          <div className="sbp-how-grid">
            {STEPS.map((s, i) => (
              <div className="sbp-how-step" key={s.num}>
                <div className="sbp-how-num">{s.num}</div>
                {i < STEPS.length - 1 && <div className="sbp-how-connector" />}
                <h3 className="sbp-how-title">{s.title}</h3>
                <p className="sbp-how-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="sbp-pricing-section">
        <div className="sbp-container">
          <h2 className="sbp-section-title">Simple, transparent pricing</h2>
          <p className="sbp-section-sub">No hidden fees. No surprises. Cancel any time.</p>
          <div className="sbp-pricing-grid">
            {PLANS.map(p => (
              <div className={`sbp-plan-card ${p.highlight ? 'highlighted' : ''}`} key={p.name}>
                {p.highlight && <div className="sbp-plan-popular">Most popular</div>}
                <div className="sbp-plan-name">{p.name}</div>
                <div className="sbp-plan-price">
                  {p.price}<span className="sbp-plan-period">{p.period}</span>
                </div>
                <ul className="sbp-plan-perks">
                  {p.perks.map(perk => (
                    <li key={perk}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.href}
                  className={p.highlight ? 'sbp-btn-primary' : 'sbp-btn-outline'}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="sbp-cta-banner">
        <div className="sbp-container">
          <h2>Start moving money smarter today</h2>
          <p>Open your Sabo Business account in under 5 minutes.</p>
          <Link to="/signup" className="sbp-btn-lime">Open account free</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SaboBusinessPage;