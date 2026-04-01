import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/MySabitPage.css';
import { sabitsApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import ReceivedBidsModal from '../../components/ReceivedBidsModal';
import CreateSabitModal from "../../components/CreateSabitModal";

interface MySabitListing {
  id: number;
  type: 'SELL' | 'BUY';
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
  const [myListings, setMyListings] = useState<MySabitListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [receivedSabitId, setReceivedSabitId] = useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadListings = async () => {
    setLoading(true);
    setError('');
    const response = await sabitsApi.list({ mine: true });
    console.log(response)
    if (response.success) {
      const sabitList = extractArray(response.data);
      console.log("sabit listing " , sabitList)
      const mapped: MySabitListing[] = sabitList.map((item: Record<string, unknown>, idx: number) => {
        const statusRaw = String(item.status || item.state || 'active');
        const status =
          statusRaw === 'completed' ? 'completed' :
          statusRaw === 'cancelled' ? 'cancelled' :
          statusRaw === 'pending' ? 'active' :
          'active';

        const typeRaw = String(item.type || (item.side as string) || 'SELL');
        const type = typeRaw === 'BUY' ? 'BUY' : 'SELL';

        const amount = Number(item.amount || 0);
        const rate = Number(item.rate || 0);
        const total = Number(item.total || item.value || amount * rate);

        return {
          id: Number(item.id || idx + 1),
          type,
          currency: String(item.currency || 'NGN') as MySabitListing['currency'],
          amount,
          rate,
          total,
          status: status as MySabitListing['status'],
          createdAt: String(item.createdAt || item.created_at || new Date().toISOString()),
          counterparty: item.SELLer
            ? {
                name: String((item.SELLer as any).name || ''),
                avatar: String((item.SELLer as any).avatar || ''),
              }
            : item.counterparty
              ? {
                  name: String((item.counterparty as any).name || ''),
                  avatar: String((item.counterparty as any).avatar || ''),
                }
              : undefined,
        };
      });
      setMyListings(mapped);
    } else {
      setMyListings([]);
      setError(response.error?.message || 'Failed to load your sabits');
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setCreateModalOpen(true);
  };

  const handleEdit = (id: number) => {
    void id;
    navigate('/dashboard/active-sabits');
  };

  const handleOpenReceivedBids = (listingId: number) => {
    // Only active SELL listings can receive bids in this UI.
    setReceivedSabitId(listingId);
    setReceivedModalOpen(true);
  };

  const handleDelete = (id: number) => {
    void (async () => {
      const response = await sabitsApi.cancel(String(id));
      if (!response.success) {
        setError(response.error?.message || 'Failed to cancel sabit');
        return;
      }
      await loadListings();
    })();
  };

  const activeCount = myListings.filter(l => l.status === 'active').length;
  const completedCount = myListings.filter(l => l.status === 'completed').length;
  const cancelledCount = myListings.filter(l => l.status === 'cancelled').length;

  return (
    <div className="my-sabit-wrapper">
      <main className="my-sabit-page">
            <div className="page-header">
              <div>
                <h1 className="page-title">My Sabits</h1>
                <p className="page-subtitle">Manage your BUY and SELL orders</p>
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

            {loading && <p style={{ marginTop: '1rem' }}>Loading your sabits...</p>}
            {error && !loading && <p style={{ marginTop: '1rem', color: 'red' }}>{error}</p>}

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
                            {listing.type === 'SELL' ? 'S' : 'B'}
                          </span>
                          <span className={`type-text ${listing.type}`}>
                            {listing.type === 'SELL' ? 'SELL' : 'BUY'}
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
                          {listing.type === 'SELL' && (
                            <button
                              className="action-btn delete"
                              onClick={() => handleOpenReceivedBids(listing.id)}
                              style={{ background: "rgba(14, 165, 233, 0.12)", borderColor: "rgba(14, 165, 233, 0.35)", color: "#0369a1" }}
                            >
                              RECEIVED BIDS
                            </button>
                          )}
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

      {receivedModalOpen && receivedSabitId != null && (
        <ReceivedBidsModal
          sabitId={receivedSabitId}
          onClose={() => {
            setReceivedModalOpen(false);
            setReceivedSabitId(null);
          }}
        />
      )}

      {createModalOpen && (
        <CreateSabitModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            void loadListings();
          }}
        />
      )}
    </div>
  );
};

export default MySabitPage;