import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sabitsApi, tradesApi, walletsApi, ratingsApi } from '../../lib/api';
import { toast } from 'react-toastify';
import PinDotsInput from '../../components/PinDotsInput';

import '../../assets/css/TransactionPage.css';
import '../../assets/css/TransactionModals.css';

interface ListingData {
  id?: number | string;
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

interface WalletView {
  id: string;
  currency: string;
  balance: number;
  symbol: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
}

const TransactionPage: React.FC = () => {
  const navigate = useNavigate();

  const { id: sabitIdParam } = useParams();
  const sabitId = sabitIdParam ? String(sabitIdParam) : '';

  const [listing, setListing] = useState<ListingData | null>(null);
  const [wallets, setWallets] = useState<WalletView[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [agreed, setAgreed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tradeId, setTradeId] = useState<string>('');
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  // Part 13: rating submission UI (after trade completion).
  const [ratingScore, setRatingScore] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSubmitting, setRatingSubmitting] = useState<boolean>(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setListing(null);
      const [sabitRes, walletsRes] = await Promise.all([
        sabitsApi.getById(sabitId),
        walletsApi.list(),
      ]);

      if (sabitRes.success && sabitRes.data) {
        const data = sabitRes.data as Record<string, any>;
        
        let rawId = data.id ?? data.sabit_id ?? data.sabitId ?? sabitId;
        if (rawId === "NaN" || rawId === "undefined" || rawId === "null") rawId = null;
        const finalId = rawId 
          ? (isNaN(Number(rawId)) ? String(rawId) : Number(rawId)) 
          : 0;

        const toNum = (val: any) => {
          const n = Number(val);
          return isNaN(n) ? 0 : n;
        };

        const mappedListing: ListingData = {
          id: finalId,
          seller: {
            name: String(data.sellerName || data.seller?.name || data.name || 'Anonymous Trader'),
            avatar: String(data.sellerAvatar || data.seller?.avatar || ''),
            rating: toNum(data.rating || data.seller?.rating || 0),
            completedTrades: toNum(data.completedTrades || data.completed || data.seller?.completedTrades || 0),
            verified: Boolean(data.verified ?? data.seller?.verified ?? false),
          },
          type: (String(data.type || 'sell').toLowerCase() === 'buy' ? 'buy' : 'sell') as ListingData['type'],
          currency: String(data.currency || 'NGN'),
          amount: toNum(data.amount || 0),
          rate: toNum(data.rate_ngn || data.rate || 0),
          available: toNum(data.available || data.remaining || 0),
          paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [],
          timeLimit: String(data.timeLimit || data.time_limit || '30 mins'),
        };
        setListing(mappedListing);
      } else {
        setError(sabitRes.error?.message || 'Failed to load sabit');
      }

      if (walletsRes.success && Array.isArray(walletsRes.data)) {
        const mappedWallets: WalletView[] = walletsRes.data.map((w: Record<string, unknown>, idx: number) => {
          const currency = String(w.currency || 'NGN');
          return {
            id: String(w.id || w.currency || idx),
            currency,
            balance: Number(w.balance || 0),
            symbol: String(w.symbol || (currency === 'GBP' ? '£' : currency === 'NGN' ? '₦' : '')),
            cardNumber: String(w.cardNumber || ''),
            cardHolder: String(w.cardHolder || ''),
            expiry: String(w.expiry || ''),
          };
        });
        setWallets(mappedWallets);
      }

      setLoading(false);
    };
    void load();
  }, [sabitId]);

  const isBuying = listing ? listing.type === 'sell' : false;
  const topCurrency = isBuying ? 'NGN' : (listing?.currency || 'NGN');
  const bottomCurrency = isBuying ? (listing?.currency || '') : 'NGN';

  const amountToDisplay = listing?.available || 0;
  const calculatedTotal = amountToDisplay * (listing?.rate || 0);

  const debitWallet = wallets.find((w) => w.currency === topCurrency) ?? wallets[0] ?? null;

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
    if (!debitWallet) return;
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!listing || !debitWallet || processing) return;
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const handleExecuteTrade = async () => {
    if (!listing || !debitWallet || processing || pin.length < 6) return;
    
    setProcessing(true);
    setError('');
    
    try {
      const response = await tradesApi.initiate({
        sabit_id: String(listing.id),
        amount: String(amountToDisplay),
        pin: pin,
      });

      if (response.success) {
        const tId = (response.data as any)?.id || (response.data as any)?.tradeId;
        setTradeId(String(tId));
        setShowPinModal(false);
        navigate(`/dashboard/trade/${tId}`);
      } else {
        setError(response.error?.message || 'Trade initiation failed. Please contact support.');
        setShowPinModal(false);
      }
    } catch (err: any) {
      setError('An unexpected error occurred during the transaction.');
      setShowPinModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/dashboard/active-sabits');
  };

  const submitRating = async () => {
    if (!tradeId) {
      toast.error('Trade reference missing. Please refresh and try again.');
      return;
    }
    if (!ratingScore) {
      toast.error('Select a rating first.');
      return;
    }
    setRatingSubmitting(true);
    try {
      const res = await ratingsApi.create({
        trade_id: tradeId,
        score: ratingScore,
        comment: ratingComment.trim() || undefined,
      });
      if (!res.success) {
        toast.error(res.error?.message || 'Failed to submit rating.');
        return;
      }
      setRatingSubmitted(true);
      toast.success('Thanks for your feedback!');
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <main className="transaction-page">
          <p>Loading transaction...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <main className="transaction-page">
          <p>{error}</p>
        </main>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="dashboard-wrapper">
        <main className="transaction-page">
          <p>Transaction not available.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
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
                    disabled={!agreed || !debitWallet}
                    onClick={handleConfirmTrade}
                  >
                    Confirm & Start Trade
                  </button>
                </div>
              </div>
            </div>
          </main>

        {/* Confirmation Modal */}
        {showConfirmModal && debitWallet && (
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

        {/* PIN Modal */}
        {showPinModal && (
          <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
            <div className="confirm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <button className="modal-close-icon" onClick={() => setShowPinModal(false)}>×</button>
              <h2 style={{ marginBottom: 10 }}>Enter PIN</h2>
              <p style={{ color: '#64748B', marginBottom: 24 }}>Enter your 6-digit transaction PIN to authorize this trade.</p>
              
              <PinDotsInput 
                value={pin}
                onChange={setPin}
                disabled={processing}
                autoFocus
              />

              <div className="modal-actions" style={{ marginTop: 30 }}>
                <button className="cancel-btn" onClick={() => setShowPinModal(false)}>Cancel</button>
                <button 
                  className="confirm-btn" 
                  onClick={handleExecuteTrade}
                  disabled={processing || pin.length < 6}
                >
                  {processing ? 'Processing...' : 'Authorize Trade'}
                </button>
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

              {!ratingSubmitted ? (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 900, marginBottom: 10 }}>Rate your counterparty</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRatingScore(n)}
                        className="page-number"
                        style={{
                          minWidth: 44,
                          background: ratingScore >= n ? '#C8F032' : 'rgba(100,116,139,0.12)',
                          borderColor: ratingScore >= n ? '#C8F032' : 'rgba(148,163,184,0.4)',
                          color: ratingScore >= n ? '#0A1E28' : '#334155',
                          fontWeight: 900,
                        }}
                      >
                        {n}★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Optional comment"
                    style={{
                      width: '100%',
                      minHeight: 90,
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      padding: 12,
                      resize: 'vertical',
                      marginBottom: 12,
                    }}
                  />
                  <div className="success-actions">
                    <button
                      className="btn-market"
                      onClick={() => void submitRating()}
                      disabled={ratingSubmitting}
                      style={{ opacity: ratingSubmitting ? 0.7 : 1 }}
                    >
                      {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="success-actions">
                  <button className="btn-market" onClick={handleCloseSuccess}>
                    BACK TO MARKETPLACE
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
};

export default TransactionPage;