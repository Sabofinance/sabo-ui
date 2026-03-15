import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardSidebar from '../../components/DashboardSidebar';
import SellModal from '../../components/SellModal';
import ActivityChart from '../../components/ActivityChart';
import TransactionHistory from '../../components/TransactionHistory';
import { SidebarProvider } from '../../context/SidebarContext';
import '../../assets/css/DashboardPage.css';

const mockWallets = [
  {
    id: 'ngn', currency: 'NGN', balance: 4950000.0,
    symbol: '₦', cardNumber: '5789 •••• •••• 2847',
    cardHolder: 'AKINGBADE ADENIYI', expiry: '06/21',
    income: 1500.50, outcome: 350.60, limit: 4000000,
  },
  {
    id: 'gbp', currency: 'GBP', balance: 1250.75,
    symbol: '£', cardNumber: '4412 •••• •••• 9901',
    cardHolder: 'AKINGBADE ADENIYI', expiry: '12/25',
    income: 800.00, outcome: 120.00, limit: 5000,
  },
];

const mockSellers = [
  { id: 1, name: 'Sarah.eth',  avatar: 'https://i.pravatar.cc/150?u=2', amount: 500,  currency: 'GBP', rate: 1650, rating: 4.9, completed: 312, type: 'buy'  },
  { id: 2, name: 'MikeCrypto', avatar: 'https://i.pravatar.cc/150?u=3', amount: 2500, currency: 'NGN', rate: 1580, rating: 4.7, completed: 89,  type: 'sell' },
  { id: 3, name: 'EmmaTrades', avatar: 'https://i.pravatar.cc/150?u=4', amount: 300,  currency: 'GBP', rate: 1680, rating: 5.0, completed: 203, type: 'buy'  },
];

/* ── Flag image URLs — reliable across all platforms ── */
const FLAG_URLS: Record<string, string> = {
  NGN: 'https://flagcdn.com/w80/ng.png',
  GBP: 'https://flagcdn.com/w80/gb.png',
  USD: 'https://flagcdn.com/w80/us.png',
  EUR: 'https://flagcdn.com/w80/eu.png',
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeWalletIndex, setActiveWalletIndex] = useState(0);
  const [isSellModalOpen,   setIsSellModalOpen]   = useState(false);

  const activeWallet = mockWallets[activeWalletIndex];
  const nextWallet   = () => setActiveWalletIndex(prev => prev === 0 ? 1 : 0);
  const prevWallet   = () => setActiveWalletIndex(prev => prev === 0 ? 1 : 0);

  const handleSellSubmit       = (amount: number, rate: number) =>
    console.log(`Listing Sabit: ${amount} ${activeWallet.currency} at ₦${rate}/1 ${activeWallet.currency}`);
  const handleBuyClick         = () => navigate('/dashboard/active-sabits');
  const handleViewAllHistory   = () => navigate('/dashboard/history');

  const formatNumber     = (num: number) => new Intl.NumberFormat('en-NG').format(num);
  const getCurrencySymbol = (c: string)  => c === 'NGN' ? '₦' : c === 'GBP' ? '£' : '';

  return (
    <SidebarProvider>
      <div className="dashboard-wrapper">
        <DashboardSidebar />

        <div className="main-content">
          <DashboardHeader />

          <main className="dashboard-padding">

            {/* Welcome */}
            <div className="welcome-message">
              <h1>Welcome back, Mrs. Akingbade! 👋</h1>
              <p>Get summary of your weekly online transactions here. You have 3 new notifications.</p>
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
                    <span className="filter-badge">Live • 3 listings</span>
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
                        {mockSellers.map(seller => (
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
                <TransactionHistory onViewAll={handleViewAllHistory} />
              </div>

              {/* ════ RIGHT COLUMN ════ */}
              <div className="right-column">

                {/* Trading stats */}
                <div className="utility-card">
                  <h3>Trading Statistics</h3>
                  <div className="stat-bar-group">
                    {[
                      { label: 'NGN/GBP Trades',       cls: 'ngn-gbp',       pct: 52 },
                      { label: 'GBP/NGN Trades',       cls: 'gbp-ngn',       pct: 21 },
                      { label: 'Same Currency Trades',  cls: 'same-currency', pct: 15 },
                      { label: 'Cross-Pair Trades',    cls: 'cross-pair',    pct: 12 },
                    ].map(bar => (
                      <div className="bar-item" key={bar.cls}>
                        <div className="bar-label">
                          <span>{bar.label}</span>
                          <span>{bar.pct}%</span>
                        </div>
                        <div className="bar-bg">
                          <div className={`bar-fill ${bar.cls}`} style={{ width: `${bar.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exchange Rate Card */}
                <div className="utility-card exchange-rate-card">
                  <h4>Exchange Rate</h4>
                  <div className="exchange-rate-visual">

                    {/* Sparkline chart */}
                    <div className="mini-chart">
                      <svg viewBox="0 0 100 40" className="rate-chart" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#C8F032" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#C8F032" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Fill area under line */}
                        <path
                          d="M0,30 L10,20 L20,25 L30,15 L40,18 L50,8 L60,12 L70,5 L80,10 L90,3 L100,5 L100,40 L0,40 Z"
                          fill="url(#chartGrad)"
                        />
                        {/* Main line */}
                        <path
                          d="M0,30 L10,20 L20,25 L30,15 L40,18 L50,8 L60,12 L70,5 L80,10 L90,3 L100,5"
                          stroke="#C8F032"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Live dot */}
                        <circle cx="100" cy="5" r="3" fill="#C8F032">
                          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                        </circle>
                      </svg>
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
                        <div className="rate-value-large">₦1,650.00</div>
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
                        <div className="rate-value-large">₦1,650.00</div>
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

                <ActivityChart />
              </div>
            </div>
          </main>
        </div>

        {isSellModalOpen && (
          <SellModal
            currency={activeWallet.currency}
            balance={activeWallet.balance}
            symbol={activeWallet.symbol}
            onClose={() => setIsSellModalOpen(false)}
            onSubmit={handleSellSubmit}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;