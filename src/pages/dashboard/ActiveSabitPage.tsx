import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardSidebar from '../../components/DashboardSidebar';
import '../../assets/css/ActiveSabitPage.css';

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

  const listings: SabitListing[] = [
    {
      id: 1,
      seller: {
        name: 'CryptoKing',
        avatar: 'https://i.pravatar.cc/150?u=5',
        rating: 4.9,
        completedTrades: 1250,
        verified: true
      },
      type: 'sell',
      currency: 'GBP',
      amount: 5000,
      rate: 1650,
      available: 3500,
      paymentMethods: ['Bank Transfer', 'Card'],
      timeLimit: '15 min'
    },
    {
      id: 2,
      seller: {
        name: 'FXTrader',
        avatar: 'https://i.pravatar.cc/150?u=6',
        rating: 4.8,
        completedTrades: 892,
        verified: true
      },
      type: 'buy',
      currency: 'NGN',
      amount: 2500000,
      rate: 1580,
      available: 1500000,
      paymentMethods: ['Bank Transfer'],
      timeLimit: '30 min'
    },
    {
      id: 3,
      seller: {
        name: 'SabiTrader',
        avatar: 'https://i.pravatar.cc/150?u=7',
        rating: 5.0,
        completedTrades: 2103,
        verified: true
      },
      type: 'sell',
      currency: 'USD',
      amount: 10000,
      rate: 1550,
      available: 7500,
      paymentMethods: ['Bank Transfer', 'PayPal'],
      timeLimit: '10 min'
    },
    {
      id: 4,
      seller: {
        name: 'NaijaPounds',
        avatar: 'https://i.pravatar.cc/150?u=8',
        rating: 4.7,
        completedTrades: 567,
        verified: false
      },
      type: 'buy',
      currency: 'GBP',
      amount: 3000,
      rate: 1640,
      available: 3000,
      paymentMethods: ['Bank Transfer'],
      timeLimit: '20 min'
    },
    {
      id: 5,
      seller: {
        name: 'EuroMaster',
        avatar: 'https://i.pravatar.cc/150?u=9',
        rating: 4.9,
        completedTrades: 1543,
        verified: true
      },
      type: 'sell',
      currency: 'EUR',
      amount: 8000,
      rate: 1720,
      available: 6000,
      paymentMethods: ['Bank Transfer', 'Card', 'Crypto'],
      timeLimit: '25 min'
    },
    {
      id: 6,
      seller: {
        name: 'GBPWhale',
        avatar: 'https://i.pravatar.cc/150?u=10',
        rating: 4.6,
        completedTrades: 345,
        verified: false
      },
      type: 'sell',
      currency: 'GBP',
      amount: 15000,
      rate: 1660,
      available: 10000,
      paymentMethods: ['Bank Transfer'],
      timeLimit: '45 min'
    },
    {
      id: 7,
      seller: {
        name: 'NairaBridge',
        avatar: 'https://i.pravatar.cc/150?u=11',
        rating: 5.0,
        completedTrades: 3120,
        verified: true
      },
      type: 'buy',
      currency: 'USD',
      amount: 20000,
      rate: 1540,
      available: 15000,
      paymentMethods: ['Bank Transfer', 'Card'],
      timeLimit: '15 min'
    },
    {
      id: 8,
      seller: {
        name: 'ForexKing',
        avatar: 'https://i.pravatar.cc/150?u=12',
        rating: 4.8,
        completedTrades: 978,
        verified: true
      },
      type: 'sell',
      currency: 'EUR',
      amount: 6000,
      rate: 1710,
      available: 4500,
      paymentMethods: ['Bank Transfer', 'Crypto'],
      timeLimit: '20 min'
    }
  ];

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

  const filteredListings = listings.filter(listing => {
    if (selectedCurrency !== 'all' && listing.currency !== selectedCurrency) return false;
    if (selectedType !== 'all' && listing.type !== selectedType) return false;
    return true;
  });

  const handleTradeClick = (listing: SabitListing) => {
    navigate(`/dashboard/transaction/${listing.id}`, { state: { listing } });
  };

  return (
    <div className="dashboard-wrapper">
      <DashboardSidebar />
      
      <div className="main-content">
        <DashboardHeader />
        
        <main className="active-sabit-page">
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
                <span className="stat-value">₦12.5M</span>
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
          <div className="listings-grid">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="listing-card">
                <div className="card-header">
                  <div className="seller-info">
                    <img src={listing.seller.avatar} alt={listing.seller.name} className="seller-avatar" />
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
    </div>
  );
};

export default ActiveSabitPage;