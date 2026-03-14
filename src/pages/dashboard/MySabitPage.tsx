import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardSidebar from '../../components/DashboardSidebar';
import '../../assets/css/MySabitPage.css';

interface MySabitListing {
  id: number;
  type: 'sell' | 'buy';
  currency: 'NGN' | 'GBP' | 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  createdAt: string;
  counterparty?: {
    name: string;
    avatar: string;
  };
}

const MySabitPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const myListings: MySabitListing[] = [
    {
      id: 1,
      type: 'sell',
      currency: 'GBP',
      amount: 5000,
      rate: 1650,
      total: 8250000,
      status: 'active',
      createdAt: '2024-03-15T10:30:00',
      counterparty: {
        name: 'CryptoKing',
        avatar: 'https://i.pravatar.cc/150?u=5'
      }
    },
    {
      id: 2,
      type: 'buy',
      currency: 'NGN',
      amount: 2500000,
      rate: 1580,
      total: 3950000,
      status: 'active',
      createdAt: '2024-03-14T15:45:00',
      counterparty: {
        name: 'FXTrader',
        avatar: 'https://i.pravatar.cc/150?u=6'
      }
    },
    {
      id: 3,
      type: 'sell',
      currency: 'USD',
      amount: 10000,
      rate: 1550,
      total: 15500000,
      status: 'active',
      createdAt: '2024-03-13T09:15:00'
    },
    {
      id: 4,
      type: 'sell',
      currency: 'GBP',
      amount: 3000,
      rate: 1640,
      total: 4920000,
      status: 'completed',
      createdAt: '2024-03-10T11:20:00',
      counterparty: {
        name: 'NaijaPounds',
        avatar: 'https://i.pravatar.cc/150?u=8'
      }
    },
    {
      id: 5,
      type: 'buy',
      currency: 'EUR',
      amount: 8000,
      rate: 1720,
      total: 13760000,
      status: 'completed',
      createdAt: '2024-03-09T14:30:00',
      counterparty: {
        name: 'EuroMaster',
        avatar: 'https://i.pravatar.cc/150?u=9'
      }
    },
    {
      id: 6,
      type: 'sell',
      currency: 'GBP',
      amount: 15000,
      rate: 1660,
      total: 24900000,
      status: 'cancelled',
      createdAt: '2024-03-08T16:45:00'
    }
  ];

  const filteredListings = myListings.filter(listing => {
    if (activeTab === 'active') return listing.status === 'active';
    if (activeTab === 'completed') return listing.status === 'completed';
    if (activeTab === 'cancelled') return listing.status === 'cancelled';
    return true;
  });

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="status-badge active">Active</span>;
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">Cancelled</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      default:
        return null;
    }
  };

  const handleCreateListing = () => {
    navigate('/dashboard');
  };

  const handleEdit = (id: number) => {
    console.log('Edit listing:', id);
  };

  const handleDelete = (id: number) => {
    console.log('Delete listing:', id);
  };

  const activeCount = myListings.filter(l => l.status === 'active').length;
  const completedCount = myListings.filter(l => l.status === 'completed').length;
  const cancelledCount = myListings.filter(l => l.status === 'cancelled').length;

  return (
    <div className="dashboard-wrapper">
      <DashboardSidebar />
      
      <div className="main-content">
        <DashboardHeader />
        
        <main className="my-sabit-page">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Sabits</h1>
              <p className="page-subtitle">Manage your buy and sell orders</p>
            </div>
            
            <button className="create-listing-btn" onClick={handleCreateListing}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create New Listing
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({activeCount})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({completedCount})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>

          {/* Listings Table */}
          <div className="listings-table-container">
            <table className="listings-table">
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>CURRENCY</th>
                  <th>AMOUNT</th>
                  <th>RATE</th>
                  <th>TOTAL (₦)</th>
                  {activeTab === 'active' && <th>STATUS</th>}
                  {activeTab === 'active' && <th>DATE</th>}
                  {(activeTab === 'completed' || activeTab === 'cancelled') && <th>DATE</th>}
                  {(activeTab === 'completed' || activeTab === 'cancelled') && <th>STATUS</th>}
                  {activeTab === 'active' && <th>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <div className="type-cell">
                        <span className={`type-indicator ${listing.type}`}>
                          {listing.type === 'sell' ? 'S' : 'B'}
                        </span>
                        <span className={`type-text ${listing.type}`}>
                          {listing.type === 'sell' ? 'SELL' : 'BUY'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="currency-badge">{listing.currency}</span>
                    </td>
                    <td>
                      <span className="amount-text">
                        {getCurrencySymbol(listing.currency)}{formatNumber(listing.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="rate-text">
                        {getCurrencySymbol('NGN')}{formatNumber(listing.rate)}
                      </span>
                    </td>
                    <td>
                      <span className="total-text">{formatNumber(listing.total)}</span>
                    </td>
                    
                    {/* Active Tab: Status then Date */}
                    {activeTab === 'active' && (
                      <>
                        <td>{getStatusBadge(listing.status)}</td>
                        <td>
                          <span className="date-text">{formatDate(listing.createdAt)}</span>
                        </td>
                      </>
                    )}
                    
                    {/* Completed/Cancelled Tab: Date then Status */}
                    {(activeTab === 'completed' || activeTab === 'cancelled') && (
                      <>
                        <td>
                          <span className="date-text">{formatDate(listing.createdAt)}</span>
                        </td>
                        <td>{getStatusBadge(listing.status)}</td>
                      </>
                    )}
                    
                    {/* Actions Column - Only for Active tab */}
                    {activeTab === 'active' && (
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="action-btn edit" 
                            onClick={() => handleEdit(listing.id)}
                          >
                            EDIT
                          </button>
                          <button 
                            className="action-btn delete" 
                            onClick={() => handleDelete(listing.id)}
                          >
                            DELETE
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredListings.length === 0 && (
              <div className="no-listings">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>No listings found</h3>
                <p>Create your first sabit listing to get started</p>
                <button className="create-first-btn" onClick={handleCreateListing}>Create Listing</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MySabitPage;