import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardSidebar from '../../components/DashboardSidebar';
import SellModal from '../../components/SellModal';
import ActivityChart from '../../components/ActivityChart';
import TransactionHistory from '../../components/TransactionHistory';
import '../../assets/css/DashboardPage.css';

const mockWallets = [
  {
    id: 'ngn',
    currency: 'NGN',
    balance: 4950000.0,
    symbol: '₦',
    flag: '🇳🇬',
    cardNumber: '5789 •••• •••• 2847',
    cardHolder: 'AKINGBADE ADENIYI',
    expiry: '06/21',
    income: 1500.50,
    outcome: 350.60,
    limit: 4000000,
  },
  {
    id: 'gbp',
    currency: 'GBP',
    balance: 1250.75,
    symbol: '£',
    flag: '🇬🇧',
    cardNumber: '4412 •••• •••• 9901',
    cardHolder: 'AKINGBADE ADENIYI',
    expiry: '12/25',
    income: 800.00,
    outcome: 120.00,
    limit: 5000,
  }
];

const mockSellers = [
  { 
    id: 1, 
    name: 'Sarah.eth', 
    avatar: 'https://i.pravatar.cc/150?u=2', 
    amount: 500, 
    currency: 'GBP', 
    rate: 1650, 
    rating: 4.9, 
    completed: 312,
    type: 'buy'
  },
  { 
    id: 2, 
    name: 'MikeCrypto', 
    avatar: 'https://i.pravatar.cc/150?u=3', 
    amount: 2500, 
    currency: 'NGN', 
    rate: 1580, 
    rating: 4.7, 
    completed: 89,
    type: 'sell'
  },
  { 
    id: 3, 
    name: 'EmmaTrades', 
    avatar: 'https://i.pravatar.cc/150?u=4', 
    amount: 300, 
    currency: 'GBP', 
    rate: 1680, 
    rating: 5.0, 
    completed: 203,
    type: 'buy'
  },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeWalletIndex, setActiveWalletIndex] = useState(0);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  
  const activeWallet = mockWallets[activeWalletIndex];

  const nextWallet = () => setActiveWalletIndex((prev) => (prev === 0 ? 1 : 0));
  const prevWallet = () => setActiveWalletIndex((prev) => (prev === 0 ? 1 : 0));

  const handleSellSubmit = (amount: number, rate: number) => {
    console.log(`Listing Sabit: ${amount} ${activeWallet.currency} at ₦${rate}/1 ${activeWallet.currency}`);
  };

  // Updated: Navigate to marketplace instead of scrolling
  const handleBuyClick = () => {
    navigate('/dashboard/active-sabits');
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const getCurrencySymbol = (currency: string): string => {
    switch(currency) {
      case 'NGN': return '₦';
      case 'GBP': return '£';
      default: return '';
    }
  };

  const handleViewAllHistory = () => navigate('/dashboard/history');

  return (
    <div className="dashboard-wrapper">
      <DashboardSidebar />
      <div className="main-content">
        <DashboardHeader />
        <main className="dashboard-padding">
          <div className="welcome-message">
            <h1>Welcome back, Mrs. Akingbade! 👋</h1>
            <p>Get summary of your weekly online transactions here. You have 3 new notifications.</p>
          </div>

          <div className="dashboard-grid">
            {/* LEFT COLUMN */}
            <div className="left-column">
              
              {/* WALLET CARD */}
              <section className="card-display-container">
                <div className={`sabo-glass-card ${activeWallet.id}`}>
                  <button className="card-arrow left" onClick={prevWallet}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <div className="card-visual">
                    <div className="cloud-effect cloud-1"></div>
                    <div className="cloud-effect cloud-2"></div>
                    <div className="cloud-effect cloud-3"></div>
                    <div className="glow-effect"></div>
                    
                    <div className="card-header-row">
                      <div className="card-brand">sabo</div>
                      <div className="card-chip">
                        <div className="chip-line"></div>
                        <div className="chip-line"></div>
                        <div className="chip-dot"></div>
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

                    <div className="card-pattern"></div>
                    <div className="card-shine"></div>
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
                      <button 
                        className="btn-sell" 
                        onClick={() => setIsSellModalOpen(true)}
                        style={{ backgroundColor: '#C8F032', color: '#0A1E28', border: 'none' }}
                      >
                        SELL {activeWallet.currency}
                      </button>
                      <button 
                        className="btn-buy-small" 
                        onClick={handleBuyClick}
                        style={{ backgroundColor: '#0A1E28', color: '#C8F032', border: 'none' }}
                      >
                        BUY {activeWallet.currency}
                      </button>
                    </div>
                  </div>

                  <button className="card-arrow right" onClick={nextWallet}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </section>

              {/* ACTIVE SABIT MARKETPLACE */}
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
                      {mockSellers.map((seller) => (
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
                          <td>
                            <span className="rate-amount">₦{formatNumber(seller.rate)}</span>
                          </td>
                          <td>
                            <span className="currency-badge">
                              {getCurrencySymbol(seller.currency)}{formatNumber(seller.amount)} {seller.currency}
                            </span>
                          </td>
                          <td className="action-cell">
                            <button 
                              className={`action-btn ${seller.type === 'sell' ? 'btn-buy-market' : 'btn-sell-market'}`}
                              onClick={() => console.log(`${seller.type === 'sell' ? 'Buy' : 'Sell'} from ${seller.name}`)}
                              style={{
                                backgroundColor: seller.type === 'sell' ? '#C8F032' : '#0A1E28',
                                color: seller.type === 'sell' ? '#0A1E28' : '#C8F032',
                                border: 'none'
                              }}
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

            {/* RIGHT COLUMN */}
            <div className="right-column">
              <div className="utility-card">
                <h3>Trading Statistics</h3>
                <div className="stat-bar-group">
                  <div className="bar-item">
                    <div className="bar-label">
                      <span>NGN/GBP Trades</span> 
                      <span>52%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill ngn-gbp" style={{width: '52%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bar-item">
                    <div className="bar-label">
                      <span>GBP/NGN Trades</span> 
                      <span>21%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill gbp-ngn" style={{width: '21%'}}></div>
                    </div>
                  </div>

                  <div className="bar-item">
                    <div className="bar-label">
                      <span>Same Currency Trades</span> 
                      <span>15%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill same-currency" style={{width: '15%'}}></div>
                    </div>
                  </div>

                  <div className="bar-item">
                    <div className="bar-label">
                      <span>Cross-Pair Trades</span> 
                      <span>12%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill cross-pair" style={{width: '12%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="utility-card exchange-card">
                <h4>Exchange Rate</h4>
                <div className="exchange-rate-visual">
                  <div className="mini-chart">
                    <svg viewBox="0 0 100 40" className="rate-chart">
                      <path d="M0,30 L10,20 L20,25 L30,15 L40,18 L50,8 L60,12 L70,5 L80,10 L90,3 L100,5" 
                            stroke="#C8F032" strokeWidth="2" fill="none" />
                      <path d="M0,30 L10,20 L20,25 L30,15 L40,18 L50,8 L60,12 L70,5 L80,10 L90,3 L100,5" 
                            stroke="#C8F032" strokeWidth="4" fill="none" opacity="0.2" />
                      <circle cx="100" cy="5" r="3" fill="#C8F032" />
                    </svg>
                  </div>
                  
                  <div className="rate-cards">
                    <div className="rate-card-item">
                      <div className="rate-pair">
                        <span className="flag">🇳🇬</span>
                        <span className="pair-text">NGN → GBP</span>
                      </div>
                      <div className="rate-value-large">₦1,650.00</div>
                      <div className="rate-sub">/ £1</div>
                    </div>
                    
                    <div className="rate-card-item">
                      <div className="rate-pair">
                        <span className="flag">🇬🇧</span>
                        <span className="pair-text">GBP → NGN</span>
                      </div>
                      <div className="rate-value-large">₦1,650.00</div>
                      <div className="rate-sub">/ £1</div>
                    </div>
                  </div>
                  
                  <div className="rate-change-indicator positive">
                    <div className="change-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
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
  );
};

export default DashboardPage;