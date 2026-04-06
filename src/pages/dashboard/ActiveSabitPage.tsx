import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/css/ActiveSabitPage.css';
import { sabitsApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import BidModal from '../../components/BidModal';
import TradeModal from "../../components/TradeModal";
import ReceivedBidsModal from '../../components/ReceivedBidsModal';
import Pagination from "../../components/Pagination";

interface SabitListing {
  id: number | string;
  userId: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completedTrades: number;
    verified: boolean;
  };
  type: 'sell' | 'buy';
  currency: 'NGN' | 'GBP' | 'USD' | 'CAD';
  amount: number;
  rate: number;
  available: number;
  paymentMethods: string[];
  timeLimit: string;
  status: string;
}

const ActiveSabitPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Initialize from query params if present
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type')?.toLowerCase() || 'all';
  const initialCurrency = queryParams.get('currency')?.toUpperCase() || 'all';

  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency === 'ALL' ? 'all' : initialCurrency);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [listings, setListings] = useState<SabitListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Update filters if URL changes
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = q.get('type')?.toLowerCase();
    const c = q.get('currency')?.toUpperCase();
    if (t) setSelectedType(t);
    if (c) setSelectedCurrency(c === 'ALL' ? 'all' : c);
  }, [location.search]);

  const kycStatus = String((user as any)?.kyc_status || '').toLowerCase();
  const isVerified = kycStatus === 'verified';
  const isPending = kycStatus.includes('pending');
  const pinSet = Boolean((user as any)?.transaction_pin_set);

  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidListing, setBidListing] = useState<SabitListing | null>(null);

  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeListing, setTradeListing] = useState<SabitListing | null>(null);

  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [receivedSabitId, setReceivedSabitId] = useState<number | string | null>(null);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const getCurrencySymbol = (currency: string): string => {
    switch(currency) {
      case 'NGN': return '₦';
      case 'GBP': return '£';
      case 'USD': return '$';
      case 'CAD': return 'CA$';
      default: return '';
    }
  };

  const filteredListings = useMemo(() => listings.filter((listing) => {
    if (selectedCurrency !== 'all' && listing.currency !== selectedCurrency) return false;
    if (selectedType !== 'all' && listing.type !== selectedType) return false;
    return true;
  }), [listings, selectedCurrency, selectedType]);

  const handleTradeClick = (listing: SabitListing) => {
    if (listing.userId === user?.id) {
      toast.info("This is your own listing.");
      return;
    }
    if (!isVerified) {
      navigate('/dashboard/kyc');
      return;
    }
    if (!pinSet) {
      toast.error('Transaction PIN required to start trades.');
      navigate('/dashboard/transaction-pin');
      return;
    }
    setTradeListing(listing);
    setTradeModalOpen(true);
  };

  const handleMakeOffer = (listing: SabitListing) => {
    if (listing.userId === user?.id) {
      toast.info("This is your own listing.");
      return;
    }
    if (!isVerified) {
      navigate('/dashboard/kyc');
      return;
    }
    if (!pinSet) {
      toast.error('Transaction PIN required to place bids.');
      navigate('/dashboard/transaction-pin');
      return;
    }
    setBidListing(listing);
    setBidModalOpen(true);
  };

  const handleViewBids = (listing: SabitListing) => {
    setReceivedSabitId(listing.id);
    setReceivedModalOpen(true);
  };

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    const params: Record<string, unknown> = { status: 'active', page, limit: 12 };
    if (selectedCurrency !== 'all') params.currency = selectedCurrency;
    if (selectedType !== 'all') params.type = selectedType;

    const response = await sabitsApi.list(params);
    if (response.success) {
      const sabitList = extractArray(response.data);
      const mapped: SabitListing[] = sabitList.map((item: Record<string, unknown>, idx: number) => {
        const seller = (item.seller || item.user || {}) as any;
        const userId = String(item.userId || item.user_id || seller?.id || '');
        
        let rawId = item.id ?? item.sabit_id ?? item.sabitId;
        if (rawId === "NaN" || rawId === "undefined" || rawId === "null") rawId = null;
        
        const finalId = rawId 
          ? (isNaN(Number(rawId)) ? String(rawId) : Number(rawId)) 
          : idx + 1;

        const toNum = (val: any) => {
          const n = Number(val);
          return isNaN(n) ? 0 : n;
        };

        const username = String(
          item.sellerUsername || 
          seller?.username || 
          item.username || 
          item.sellerName || 
          seller?.name || 
          item.name || 
          'User'
        );

        return {
          id: finalId,
          userId,
          seller: {
            id: userId,
            name: username,
            avatar: String(item.sellerAvatar || seller?.avatar || seller?.profile_picture_url || item.avatar || item.profile_picture_url || ''),
            rating: toNum(item.rating || item.sellerRating || seller?.rating || 0),
            completedTrades: toNum(item.completed || item.completedTrades || item.sellerCompletedTrades || seller?.completedTrades || 0),
            verified: Boolean(item.verified ?? seller?.verified ?? false),
          },
          type: String(item.type || '').toLowerCase() === 'buy' ? 'buy' : 'sell',
          currency: String(item.currency || 'NGN') as SabitListing['currency'],
          amount: toNum(item.amount || 0),
          rate: toNum(item.rate_ngn || item.rate || 0),
          available: toNum(item.available || item.remaining || 0),
          paymentMethods: Array.isArray(item.paymentMethods)
            ? (item.paymentMethods as string[])
            : ((item.paymentMethodsList as string[] | undefined) || []),
          timeLimit: String(item.timeLimit || item.time_limit || '30 mins'),
          status: String(item.status || item.state || 'active'),
        };
      });
      setListings(mapped);
      const meta = (response.data as any)?.meta || (response.data as any);
      setTotalPages(meta.totalPages || meta.last_page || 1);
      setCurrentPage(page);
    } else {
      setListings([]);
      setError(response.success ? '' : (response.error?.message || 'Failed to load listings'));
    }
    setLoading(false);
  }, [selectedCurrency, selectedType]);

  useEffect(() => {
    void load(1);
  }, [load]);

  return (
    <div className="active-sabit-wrapper">
      <main className="active-sabit-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Active Marketplace</h1>
            <p className="page-subtitle">Browse available offers from verified traders</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-label">Listings</span>
              <span className="stat-value">{loading ? '—' : listings.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">24h Volume</span>
              <span className="stat-value">—</span>
            </div>
          </div>
        </div>

        {!isVerified && (
          <div className="kyc-banner">
            <span className="kyc-banner-icon">⚠️</span>
            <span className="kyc-banner-text">
              <strong>{isPending ? 'KYC pending review' : 'KYC required'}</strong>
              {' — '}
              {isPending ? 'Trading unlocks once verified.' : 'Complete identity verification to trade.'}
            </span>
            <button className="kyc-banner-btn" onClick={() => navigate('/dashboard/kyc')}>
              {isPending ? 'View Status' : 'Complete KYC'}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">

          {/* Type toggle */}
          <div className="filter-type-toggle">
            {([
              { value: 'all',  label: 'All' },
              { value: 'sell', label: '↑ Sell' },
              { value: 'buy',  label: '↓ Buy' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                className={`filter-type-btn ${selectedType === value ? 'active' : ''}`}
                onClick={() => setSelectedType(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Currency chips */}
          <div className="filter-currency-group">
            <button
              className={`filter-currency-btn ${selectedCurrency === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCurrency('all')}
            >
              All
            </button>
            {([
              { value: 'NGN', flag: 'https://flagcdn.com/w20/ng.png' },
              { value: 'GBP', flag: 'https://flagcdn.com/w20/gb.png' },
              { value: 'USD', flag: 'https://flagcdn.com/w20/us.png' },
              { value: 'CAD', flag: 'https://flagcdn.com/w20/ca.png' },
            ] as const).map(({ value, flag }) => (
              <button
                key={value}
                className={`filter-currency-btn ${selectedCurrency === value ? 'active' : ''}`}
                onClick={() => setSelectedCurrency(value)}
              >
                <img src={flag} alt={value} className="filter-flag" />
                {value}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="filter-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search traders..." />
          </div>

          {/* Clear — only when filters are active */}
          {(selectedCurrency !== 'all' || selectedType !== 'all') && (
            <button
              className="filter-clear-btn"
              onClick={() => { setSelectedCurrency('all'); setSelectedType('all'); }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </button>
          )}

        </div>

        {error && !loading && (
          <div className="as-error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Listings Grid */}
        <div className="listings-grid">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="as-skeleton-card">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                  <div className="as-skeleton-cell" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="as-skeleton-cell" style={{ height: 13, width: '60%' }} />
                    <div className="as-skeleton-cell" style={{ height: 11, width: '40%' }} />
                  </div>
                </div>
                <div className="as-skeleton-cell" style={{ height: 32, marginBottom: 12 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="as-skeleton-cell" style={{ height: 12, width: '80%' }} />
                  <div className="as-skeleton-cell" style={{ height: 12, width: '65%' }} />
                  <div className="as-skeleton-cell" style={{ height: 12, width: '50%' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <div className="as-skeleton-cell" style={{ height: 38, flex: 1, borderRadius: 10 }} />
                  <div className="as-skeleton-cell" style={{ height: 38, flex: 1, borderRadius: 10 }} />
                </div>
              </div>
            ))
          ) : filteredListings.length === 0 ? (
            <div className="no-results" style={{ gridColumn: '1 / -1' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="18" rx="3" />
                <path d="M8 10h8M8 14h5" />
              </svg>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or check back soon.</p>
            </div>
          ) : (
            filteredListings.map((listing) => {
              const initials = listing.seller.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const isOwn = listing.userId === user?.id;
              return (
                <div key={listing.id} className="listing-card">
                  <div className="card-header">
                    <div className="seller-info">
                      {listing.seller.avatar ? (
                        <img src={listing.seller.avatar} alt={listing.seller.name} className="seller-avatar" />
                      ) : (
                        <div className="seller-avatar-initials">{initials}</div>
                      )}
                      <div>
                        <div className="seller-name-row">
                          <h3 className="seller-name">{listing.seller.name}</h3>
                          {listing.seller.verified && (
                            <svg className="verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="seller-rating">
                          <span>★ {listing.seller.rating}</span>
                          <span className="dot">·</span>
                          <span>{listing.seller.completedTrades} trades</span>
                        </div>
                      </div>
                    </div>
                    <span className={`type-badge ${listing.type}`}>
                      {listing.type === 'sell' ? 'SELL' : 'BUY'}
                    </span>
                  </div>

                  <div className="card-content">
                    <div className="currency-rate">
                      <span className="currency">{listing.currency} rate</span>
                      <span className="rate">₦{formatNumber(listing.rate)}</span>
                    </div>

                    <div className="amount-info">
                      <div className="amount-row">
                        <span className="label">Amount</span>
                        <span className="value">{getCurrencySymbol(listing.currency)}{formatNumber(listing.amount)}</span>
                      </div>
                      {listing.available > 0 && (
                        <div className="amount-row">
                          <span className="label">Available</span>
                          <span className="value">{getCurrencySymbol(listing.currency)}{formatNumber(listing.available)}</span>
                        </div>
                      )}
                    </div>

                    {listing.paymentMethods.length > 0 && (
                      <div className="payment-methods">
                        <span className="label">Payment</span>
                        <div className="method-tags">
                          {listing.paymentMethods.map((method, idx) => (
                            <span key={idx} className="method-tag">{method}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="card-footer">
                      <div className="time-limit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{listing.timeLimit}</span>
                      </div>

                      <div className="card-actions">
                        {isOwn ? (
                          <>
                            <button className="trade-btn ghost" onClick={() => navigate('/dashboard/my-sabits')}>
                              Your Listing
                            </button>
                            {listing.type === 'sell' && (
                              <button className="trade-btn info" onClick={() => handleViewBids(listing)}>
                                View Bids
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              className={`trade-btn ${listing.type === 'sell' ? 'primary' : 'lime'}`}
                              onClick={() => handleTradeClick(listing)}
                              disabled={!isVerified || listing.status !== 'active'}
                            >
                              {listing.type === 'sell' ? 'Buy Now' : 'Sell Now'}
                            </button>
                            {listing.type === 'sell' && (
                              <button
                                className="trade-btn outline"
                                onClick={() => handleMakeOffer(listing)}
                                disabled={!isVerified || listing.status !== 'active'}
                              >
                                Place Bid
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => void load(p)}
          isLoading={loading}
        />

        {bidModalOpen && bidListing && (
          <BidModal
            listing={{
              id: bidListing.id,
              rate_ngn: bidListing.rate,
              available: bidListing.available,
              currency: bidListing.currency,
            }}
            onClose={() => {
              setBidModalOpen(false);
              setBidListing(null);
            }}
          />
        )}

        {tradeModalOpen && tradeListing && (
          <TradeModal
            listing={{
              id: tradeListing.id,
              rate: tradeListing.rate,
              available: tradeListing.available,
              currency: tradeListing.currency,
              type: tradeListing.type,
            }}
            onClose={() => {
              setTradeModalOpen(false);
              setTradeListing(null);
            }}
          />
        )}

        {receivedModalOpen && receivedSabitId != null && (
          <ReceivedBidsModal
            sabitId={receivedSabitId}
            onClose={() => {
              setReceivedModalOpen(false);
              setReceivedSabitId(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default ActiveSabitPage;