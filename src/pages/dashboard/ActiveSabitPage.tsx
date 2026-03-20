import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/ActiveSabitPage.css';
import { sabitsApi } from '../../lib/api';

interface SabitListing {
  id: number;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    completedTrades: number;
    verified: boolean;
  };
  type: 'sell' | 'buy';
  currency: 'NGN' | 'GBP' | 'USD' | 'EUR';
  amount: number;
  rate: number;
  available: number;
  paymentMethods: string[];
  timeLimit: string;
}

const ActiveSabitPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [listings, setListings] = useState<SabitListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const getCurrencySymbol = (currency: string): string => {
    switch(currency) {
      case 'NGN': return '₦';
      case 'GBP': return '£';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return '';
    }
  };

  const filteredListings = useMemo(() => listings.filter((listing) => {
    if (selectedCurrency !== 'all' && listing.currency !== selectedCurrency) return false;
    if (selectedType !== 'all' && listing.type !== selectedType) return false;
    return true;
  }), [listings, selectedCurrency, selectedType]);

  const handleTradeClick = (listing: SabitListing) => {
    navigate(`/dashboard/transaction/${listing.id}`);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const params: Record<string, unknown> = { status: 'active' };
      if (selectedCurrency !== 'all') params.currency = selectedCurrency;
      if (selectedType !== 'all') params.type = selectedType;

      const response = await sabitsApi.list(params);
      if (response.success && Array.isArray(response.data)) {
        const mapped: SabitListing[] = response.data.map((item: Record<string, unknown>, idx: number) => {
          const seller = item.seller as any;
          return {
            id: Number(item.id || idx + 1),
            seller: {
              name: String(item.sellerName || seller?.name || item.name || ''),
              avatar: String(item.sellerAvatar || seller?.avatar || item.avatar || ''),
              rating: Number(item.rating || item.sellerRating || seller?.rating || 0),
              completedTrades: Number(item.completed || item.completedTrades || item.sellerCompletedTrades || seller?.completedTrades || 0),
              verified: Boolean(item.verified ?? seller?.verified ?? false),
            },
            type: item.type === 'sell' ? 'sell' : 'buy',
            currency: String(item.currency || 'NGN') as SabitListing['currency'],
            amount: Number(item.amount || 0),
            rate: Number(item.rate || 0),
            available: Number(item.available || item.remaining || 0),
            paymentMethods: Array.isArray(item.paymentMethods)
              ? (item.paymentMethods as string[])
              : ((item.paymentMethodsList as string[] | undefined) || []),
            timeLimit: String(item.timeLimit || item.time_limit || ''),
          };
        });
        setListings(mapped);
      } else {
        setListings([]);
        setError(response.success ? '' : (response.error?.message || 'Failed to load listings'));
      }
      setLoading(false);
    };
    void load();
  }, [selectedCurrency, selectedType]);

  return (
    <div className="active-sabit-wrapper">
      <main className="active-sabit-padding">
            <div className="page-header">
              <div>
                <h1 className="page-title">Active Sabit Marketplace</h1>
                <p className="page-subtitle">Browse available offers from verified traders</p>
              </div>
              
              <div className="header-stats">
                <div className="stat-badge">
                  <span className="stat-label">Total Listings</span>
                  <span className="stat-value">{listings.length}</span>
                </div>
                <div className="stat-badge">
                  <span className="stat-label">24h Volume</span>
                  <span className="stat-value">—</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <label>Currency</label>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${selectedCurrency === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-btn ${selectedCurrency === 'NGN' ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency('NGN')}
                  >
                    🇳🇬 NGN
                  </button>
                  <button 
                    className={`filter-btn ${selectedCurrency === 'GBP' ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency('GBP')}
                  >
                    🇬🇧 GBP
                  </button>
                  <button 
                    className={`filter-btn ${selectedCurrency === 'USD' ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency('USD')}
                  >
                    🇺🇸 USD
                  </button>
                  <button 
                    className={`filter-btn ${selectedCurrency === 'EUR' ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency('EUR')}
                  >
                    🇪🇺 EUR
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <label>Type</label>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedType('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-btn sell ${selectedType === 'sell' ? 'active' : ''}`}
                    onClick={() => setSelectedType('sell')}
                  >
                    Sell
                  </button>
                  <button 
                    className={`filter-btn buy ${selectedType === 'buy' ? 'active' : ''}`}
                    onClick={() => setSelectedType('buy')}
                  >
                    Buy
                  </button>
                </div>
              </div>

              <div className="filter-search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" placeholder="Search by seller or currency..." />
              </div>
            </div>

            {/* Listings Grid */}
            {loading && <p style={{ marginTop: '1rem' }}>Loading listings...</p>}
            {error && !loading && <p style={{ marginTop: '1rem', color: 'red' }}>{error}</p>}
            <div className="listings-grid">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="listing-card">
                  <div className="card-header">
                      <div className="seller-info">
                      {listing.seller.avatar && (
                        <img src={listing.seller.avatar} alt={listing.seller.name} className="seller-avatar" />
                      )}
                      <div>
                        <div className="seller-name-row">
                          <h3 className="seller-name">{listing.seller.name}</h3>
                          {listing.seller.verified && (
                            <svg className="verified-badge" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8F032" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="seller-rating">
                          <span>⭐ {listing.seller.rating}</span>
                          <span className="dot">•</span>
                          <span>{listing.seller.completedTrades} trades</span>
                        </div>
                      </div>
                    </div>
                    <span className={`type-badge ${listing.type}`}>
                      {listing.type === 'sell' ? 'SELLING' : 'BUYING'}
                    </span>
                  </div>

                  <div className="card-content">
                    <div className="currency-rate">
                      <span className="currency">{listing.currency}</span>
                      <span className="rate">{getCurrencySymbol(listing.currency)}{formatNumber(listing.rate)}</span>
                    </div>

                    <div className="amount-info">
                      <div className="amount-row">
                        <span className="label">Amount</span>
                        <span className="value">{getCurrencySymbol(listing.currency)}{formatNumber(listing.amount)}</span>
                      </div>
                      <div className="amount-row">
                        <span className="label">Available</span>
                        <span className="value">{getCurrencySymbol(listing.currency)}{formatNumber(listing.available)}</span>
                      </div>
                    </div>

                    <div className="payment-methods">
                      <span className="label">Payment</span>
                      <div className="method-tags">
                        {listing.paymentMethods.map((method, index) => (
                          <span key={index} className="method-tag">{method}</span>
                        ))}
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="time-limit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{listing.timeLimit}</span>
                      </div>
                      <button 
                        className={`trade-btn ${listing.type}`}
                        onClick={() => handleTradeClick(listing)}
                      >
                        {listing.type === 'sell' ? 'Buy' : 'Sell'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>No listings found</h3>
                <p>Try adjusting your filters</p>
              </div>
            )}
      </main>
    </div>
  );
};

export default ActiveSabitPage;