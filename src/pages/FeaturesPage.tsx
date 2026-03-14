// src/pages/FeaturesPage.tsx

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../assets/css/FeaturesPage.css';

// Image paths for all phone mockups
import heroPhone from '../assets/images/hero-phone.png';
import walletPhones from '../assets/images/wallet-mockups.png';
import lightningPhone from '../assets/images/lightning-speed.png';
import p2pPhones from '../assets/images/p2p-mockups.png';
import securityPhone from '../assets/images/security-mockup.png';
import trackPhone from '../assets/images/track-mockup.png';

const featureGrid = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: "Wallet First",
    desc: "Manage all your currencies in one place with our multi-currency wallet."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Standard Exchange",
    desc: "Convert currencies instantly at SABO's daily competitive rates."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "P2P Marketplace",
    desc: "Post offers and match with real users in a secure environment."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Escrow Locking",
    desc: "Funds are held securely in escrow until both parties are satisfied."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "KYC Security",
    desc: "Advanced identity verification to keep the community safe."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Fast Settlement",
    desc: "Experience near-instant transactions within the ecosystem."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Transparent Fees",
    desc: "No hidden charges. See exactly what you pay every time."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h4" />
      </svg>
    ),
    title: "Banking Integrations",
    desc: "Seamlessly move funds between your bank and SABO."
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a1.94 1.94 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Real-time Notifications",
    desc: "Stay updated on every trade and account activity instantly."
  },
];

export const FeaturesPage = () => {
  const handleGetStarted = () => {
    window.location.href = '/signup';   // Change to '/login' if you prefer
  };

  return (
    <div className="features-page-wrapper">
      <Header />

      {/* HERO SECTION */}
      <section className="features-hero">
        <div className="features-container">
          <div className="hero-flex-layout">
            <div className="hero-text-side">
              <h1 className="heavy-heading">Powerful tools for fast, safe currency exchange</h1>
              <p className="hero-desc">SABO brings you the tools you need to exchange money at home and abroad, fast and easy.</p>
              
              <button className="lime-download-btn" onClick={handleGetStarted}>
                Get Started
              </button>
              
              <p className="small-tagline">Trusted by Nigerians in diaspora, and back home for you.</p>
            </div>
            <div className="hero-visual-side">
              <img src={heroPhone} alt="Sabo Interface" className="floating-phone" />
            </div>
          </div>
        </div>
      </section>

      {/* 9-GRID ICON FEATURES */}
      <section className="icon-grid-section">
        <div className="features-container">
          <div className="features-main-grid">
            {featureGrid.map((item, index) => (
              <div key={index} className="icon-feature-card">
                <div className="feature-icon-circle">{item.icon}</div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="feature-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALTERNATING CONTENT ROWS */}
      <div className="features-alternating-rows">
        {/* Row 1: Your money, organised */}
        <section className="feature-row">
          <div className="features-container row-inner">
            <div className="row-text">
              <h2>Your money, organised the right way</h2>
              <ul className="feature-bullets">
                <li>Keep track of all your balances in one place.</li>
                <li>View exchange rates and history easily.</li>
                <li>Transfer between wallets with just a few taps.</li>
              </ul>
            </div>
            <div className="row-image">
              <img src={walletPhones} alt="Multi-currency wallets" />
            </div>
          </div>
        </section>

        {/* Row 2: Lightning speed */}
        <section className="feature-row bg-cream-alt">
          <div className="features-container row-inner reverse">
            <div className="row-text">
              <h2>Exchange at lightning speed</h2>
              <p className="row-para">SABO’s fast settlement system ensures your funds move when you need them.</p>
              <p className="row-para">No more waiting days for transactions to clear, get your value instantly.</p>
            </div>
            <div className="row-image">
              <img src={lightningPhone} alt="Speedy transactions" />
            </div>
          </div>
        </section>

        {/* Row 3: Smarter P2P */}
        <section className="feature-row">
          <div className="features-container row-inner">
            <div className="row-text">
              <h2>Smarter P2P, built for real people</h2>
              <ul className="feature-bullets">
                <li>Match with trusted users in our marketplace.</li>
                <li>Set your own rates and find the best deals.</li>
                <li>Automated settlement ensures peace of mind.</li>
              </ul>
            </div>
            <div className="row-image">
              <img src={p2pPhones} alt="P2P Marketplace" />
            </div>
          </div>
        </section>

        {/* Row 4: Full protection */}
        <section className="feature-row bg-cream-alt">
          <div className="features-container row-inner reverse">
            <div className="row-text">
              <h2>Full protection on every trade</h2>
              <p className="row-para">Our secure escrow system protects both buyers and sellers from fraud.</p>
              <p className="row-para">Advanced encryption keeps your data and funds safe 24/7, no bank-to-bank risk.</p>
            </div>
            <div className="row-image">
              <img src={securityPhone} alt="Secure escrow" />
            </div>
          </div>
        </section>

        {/* Row 5: Track everything */}
        <section className="feature-row">
          <div className="features-container row-inner">
            <div className="row-text">
              <h2>Track everything with confidence</h2>
              <ul className="feature-bullets">
                <li>Real-time transaction history at your fingertips.</li>
                <li>Detailed receipts for every exchange you make.</li>
                <li>Stay in total control of your financial journey.</li>
              </ul>
            </div>
            <div className="row-image">
              <img src={trackPhone} alt="Transaction history" />
            </div>
          </div>
        </section>
      </div>

      {/* FINAL CALL TO ACTION */}
      <section className="final-cta-section">
        <div className="features-container">
          <h2 className="cta-heading">Ready to exchange with confidence?</h2>
          <div className="cta-button-group">
            <button className="lime-download-btn" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="dark-join-btn" onClick={handleGetStarted}>
              Join us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};