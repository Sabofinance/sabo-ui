import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardSidebar from '../../components/DashboardSidebar';
import { SidebarProvider } from '../../context/SidebarContext';
import '../../assets/css/TransactionPage.css';
import '../../assets/css/TransactionModals.css';

interface ListingData {
  id?: number;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    completedTrades: number;
    verified: boolean;
  };
  type: 'sell' | 'buy';
  currency: string;
  amount: number;
  rate: number;
  available: number;
  paymentMethods: string[];
  timeLimit: string;
}

// Mock wallets (same as DashboardPage)
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
  },
  {
    id: 'usd',
    currency: 'USD',
    balance: 0,
    symbol: '$',
    flag: '🇺🇸',
    cardNumber: '**** •••• •••• 0000',
    cardHolder: 'AKINGBADE ADENIYI',
    expiry: '12/26',
  },
  {
    id: 'eur',
    currency: 'EUR',
    balance: 0,
    symbol: '€',
    flag: '🇪🇺',
    cardNumber: '**** •••• •••• 0000',
    cardHolder: 'AKINGBADE ADENIYI',
    expiry: '12/26',
  },
];

const TransactionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safeguard with Demo Data if no state is present
  const listing: ListingData = location.state?.listing || {
    seller: { name: "CryptoKing", avatar: "https://i.pravatar.cc/150?u=cryptoking", rating: 5.0, completedTrades: 1420, verified: true },
    type: 'sell',
    currency: 'USD',
    amount: 1000,
    rate: 1550,
    available: 500,
    paymentMethods: ['Direct Bank Transfer'],
    timeLimit: '15 min'
  };

  const [agreed, setAgreed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isBuying = listing.type === 'sell'; 
  const topCurrency = isBuying ? 'NGN' : listing.currency;
  const bottomCurrency = isBuying ? listing.currency : 'NGN';
  
  const amountToDisplay = listing.available;
  const calculatedTotal = amountToDisplay * listing.rate;

  // Find the wallet that will be debited (the one the user sends)
  const debitWallet = mockWallets.find(w => w.currency === topCurrency) || mockWallets[0];

  // Type-safe flag fetcher
  const getFlag = (code: string): string => {
    const flags: Record<string, string> = {
      NGN: "https://flagcdn.com/w80/ng.png",
      USD: "https://flagcdn.com/w80/us.png",
      GBP: "https://flagcdn.com/w80/gb.png",
      EUR: "https://flagcdn.com/w80/eu.png"
    };
    return flags[code] || flags['USD'];
  };

  const handleConfirmTrade = () => {
    if (!agreed) return;
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/dashboard/active-sabits');
  };

  return (
    <SidebarProvider>
      <div className="dashboard-wrapper">
        <DashboardSidebar />
        <div className="main-content">
          <DashboardHeader />
          
          <main className="transaction-page">
            {/* Back Navigation */}
            <button className="back-btn" onClick={() => navigate('/dashboard/active-sabits')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
              Back to Marketplace
            </button>

            {/* Header Section */}
            <div className="transaction-header">
              <h1>Complete Transaction</h1>
              <p>You are confirming a trade with <strong>{listing.seller.name}</strong></p>
            </div>

            <div className="spread-layout">
              {/* LEFT SIDE: THE LOCKED TRANSACTION FLOW */}
              <div className="exchange-card">
                
                {/* BOX 1: WHAT YOU GIVE */}
                <div className="display-group">
                  <div>
                    <span className="display-label">YOU SEND</span>
                    <div className="locked-number">
                      {isBuying ? calculatedTotal.toLocaleString() : amountToDisplay.toLocaleString()}
                    </div>
                  </div>
                  <div className="flag-section">
                    <img src={getFlag(topCurrency)} className="flag-icon" alt="flag" />
                    <span className="currency-text">{topCurrency}</span>
                  </div>
                </div>

                {/* DASHED BRIDGE CONNECTOR */}
                <div className="visual-bridge">
                  <div className="bridge-line">
                    <div className="bridge-node node-top"></div>
                    <div className="bridge-node node-bottom"></div>
                  </div>
                </div>

                {/* BOX 2: WHAT YOU GET */}
                <div className="display-group">
                  <div>
                    <span className="display-label">YOU RECEIVE</span>
                    <div className="locked-number">
                      {isBuying ? amountToDisplay.toLocaleString() : calculatedTotal.toLocaleString()}
                    </div>
                  </div>
                  <div className="flag-section">
                    <img src={getFlag(bottomCurrency)} className="flag-icon" alt="flag" />
                    <span className="currency-text">{bottomCurrency}</span>
                  </div>
                </div>

                {/* RATE FOOTER */}
                <div style={{ marginTop: '40px', padding: '20px', background: '#F1F5F9', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ color: '#64748B', fontSize: '15px' }}>Locked Exchange Rate: </span>
                  <span style={{ fontWeight: 800, color: '#0A1E28' }}>1 {listing.currency} = {listing.rate.toLocaleString()} NGN</span>
                </div>
              </div>

              {/* RIGHT SIDE: MERCHANT & SUMMARY */}
              <div className="info-sidebar">
                {/* Merchant Tile */}
                <div className="tile">
                  <h3>Merchant Details</h3>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <img src={listing.seller.avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid #C8F032' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px' }}>{listing.seller.name}</div>
                      <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                        Verified Merchant • {listing.seller.completedTrades} Successful Trades
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Tile */}
                <div className="tile">
                  <h3>Trade Summary</h3>
                  <div className="row-item">
                    <span style={{ color: '#64748B' }}>Payment Method</span>
                    <span style={{ fontWeight: 700 }}>{listing.paymentMethods[0]}</span>
                  </div>
                  <div className="row-item">
                    <span style={{ color: '#64748B' }}>Time Limit</span>
                    <span style={{ fontWeight: 700 }}>{listing.timeLimit}</span>
                  </div>
                  <div className="row-item" style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '20px', marginTop: '20px' }}>
                    <span style={{ fontWeight: 700 }}>Total Payable</span>
                    <span style={{ fontWeight: 900, color: '#0A1E28', fontSize: '22px' }}>
                      NGN {calculatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Section */}
                <div style={{ padding: '0 10px' }}>
                  <label style={{ display: 'flex', gap: '15px', fontSize: '15px', cursor: 'pointer', marginBottom: '30px', color: '#475569' }}>
                    <input 
                      type="checkbox" 
                      checked={agreed} 
                      onChange={(e) => setAgreed(e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: '#C8F032' }} 
                    />
                    <span>I agree that the information above is correct and I am ready to proceed with this trade.</span>
                  </label>
                  
                  <button 
                    className="confirm-btn-main"
                    disabled={!agreed}
                    onClick={handleConfirmTrade}
                  >
                    Confirm & Start Trade
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
            <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close-icon" onClick={() => setShowConfirmModal(false)}>×</button>
              <h2>Confirm Payment</h2>
              <p>The following card will be debited:</p>

              {/* Mini Card Preview (exact design from dashboard) */}
              <div className={`mini-card-preview ${debitWallet.id}`}>
                <div className="mini-card-visual">
                  <div className="cloud-effect cloud-1"></div>
                  <div className="cloud-effect cloud-2"></div>
                  <div className="cloud-effect cloud-3"></div>
                  <div className="glow-effect"></div>

                  <div className="mini-card-header">
                    <div className="mini-card-brand">sabo</div>
                    <div className="mini-card-chip">
                      <div className="chip-line"></div>
                      <div className="chip-line"></div>
                      <div className="chip-dot"></div>
                    </div>
                  </div>

                  <div className="mini-card-number">{debitWallet.cardNumber}</div>

                  <div className="mini-card-footer">
                    <div className="info-group">
                      <small>Card holder</small>
                      <p>{debitWallet.cardHolder}</p>
                    </div>
                    <div className="info-group">
                      <small>Expiry date</small>
                      <p>{debitWallet.expiry}</p>
                    </div>
                  </div>

                  <div className="card-pattern"></div>
                  <div className="card-shine"></div>
                </div>
              </div>

              <div className="amount-confirm">
                <span>Amount: {debitWallet.symbol}{isBuying ? calculatedTotal.toLocaleString() : amountToDisplay.toLocaleString()}</span>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button className="confirm-btn" onClick={handleConfirmPayment}>Confirm Payment</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal (uses same style as SellSuccessModal) */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={handleCloseSuccess}>
            <div className="success-modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close-icon" onClick={handleCloseSuccess}>×</button>
              <div className="success-icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C8F032" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="success-title">Trade Successful!</h2>
              <p className="success-message">
                You have successfully {isBuying ? 'bought' : 'sold'} <strong>{amountToDisplay} {listing.currency}</strong><br />
                and the funds have been transferred.
              </p>
              <div className="success-actions">
                <button className="btn-market" onClick={handleCloseSuccess}>
                  BACK TO MARKETPLACE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default TransactionPage;