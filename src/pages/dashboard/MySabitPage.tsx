import React, { useEffect, useState, useCallback } from 'react';
import '../../assets/css/MySabitPage.css';
import { sabitsApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import ReceivedBidsModal from '../../components/ReceivedBidsModal';
import CreateSabitModal from "../../components/CreateSabitModal";
import Pagination from "../../components/Pagination";
import { useAuth } from '../../context/AuthContext';

interface MySabitListing {
  id: number | string;
  type: 'SELL' | 'BUY';
  currency: 'NGN' | 'GBP' | 'USD' | 'CAD';
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
  // const navigate = useNavigate();
  const { user } = useAuth();

  // Debugging logs for status tracing
  useEffect(() => {
    if (user) {
      console.log(`[MySabit] User: ${user.id}, KYC: ${user.kyc_status}, PIN Set: ${user.transaction_pin_set}`);
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [myListings, setMyListings] = useState<MySabitListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [receivedSabitId, setReceivedSabitId] = useState<number | string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editListing, setEditListing] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = await sabitsApi.list({ mine: true, page: currentPage, limit });
    if (response.success) {
      const sabitList = extractArray(response.data);
      const mapped: MySabitListing[] = sabitList.map((item: Record<string, unknown>, idx: number) => {
        // Robust ID extraction
        let rawId = item.id ?? item.sabit_id ?? item.sabitId;
        if (rawId === "NaN" || rawId === "undefined" || rawId === "null") rawId = null;
        const finalId = rawId 
          ? (isNaN(Number(rawId)) ? String(rawId) : Number(rawId)) 
          : idx + 1;

        const statusRaw = String(item.status || item.state || 'active').toLowerCase();
        const status =
          statusRaw === 'completed' ? 'completed' :
          statusRaw === 'cancelled' || statusRaw === 'rejected' ? 'cancelled' :
          'active';

        const typeRaw = String(item.type || (item.side as string) || 'SELL');
        const type = typeRaw === 'BUY' ? 'BUY' : 'SELL';

        // Robust number conversion
        const toNum = (val: any) => {
          const n = Number(val);
          return isNaN(n) ? 0 : n;
        };

        const amount = toNum(item.amount || 0);
        const rate = toNum(item.rate_ngn || item.rate || 0);
        const total = toNum(item.total || item.value || amount * rate);

        return {
          id: finalId,
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
      const meta = (response.data as any);
      setTotal(meta.total || meta.totalItems || 0);
    } else {
      setMyListings([]);
      setError(response.error?.message || 'Failed to load your sabits');
    }
    setLoading(false);
  }, [currentPage, limit]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

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
      case 'CAD': return 'CA$';
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

  const handleEdit = (listing: MySabitListing) => {
    setEditListing({
      id: listing.id,
      type: listing.type,
      currency: listing.currency,
      amount: listing.amount,
      rate: listing.rate
    });
    setCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateModalOpen(false);
    setEditListing(null);
  };

  const handleOpenReceivedBids = (listingId: number | string) => {
    // Only active SELL listings can receive bids in this UI.
    setReceivedSabitId(listingId);
    setReceivedModalOpen(true);
  };

  const handleDelete = (id: number | string) => {
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
            <p className="page-subtitle">Manage your BUY and SELL listings</p>
          </div>
          <div className="ms-header-actions">
            <button
              className="ms-btn-refresh"
              onClick={() => void loadListings()}
              disabled={loading}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="ms-btn-create" onClick={handleCreateListing}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Listing
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            Active ({activeCount})
          </button>
          <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
            Completed ({completedCount})
          </button>
          <button className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>
            Cancelled ({cancelledCount})
          </button>
        </div>

        {error && !loading && (
          <div className="ms-error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Listings Table */}
        <div className="listings-table-container">
          <table className="listings-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Total (₦)</th>
                <th>Status</th>
                <th>Date</th>
                {activeTab === 'active' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="ms-skeleton-row">
                    <td><div className="ms-skeleton-cell" style={{ width: 80 }} /></td>
                    <td><div className="ms-skeleton-cell" style={{ width: 55 }} /></td>
                    <td><div className="ms-skeleton-cell" style={{ width: 90 }} /></td>
                    <td><div className="ms-skeleton-cell" style={{ width: 90 }} /></td>
                    <td><div className="ms-skeleton-cell" style={{ width: 100 }} /></td>
                    <td><div className="ms-skeleton-cell" style={{ width: 70 }} /></td>
                    <td><div className="ms-skeleton-cell" style={{ width: 80 }} /></td>
                    {activeTab === 'active' && <td><div className="ms-skeleton-cell" style={{ width: 140 }} /></td>}
                  </tr>
                ))
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'active' ? 8 : 7}>
                    <div className="no-listings">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="18" rx="3" />
                        <path d="M8 10h8M8 14h5" />
                      </svg>
                      <h3>No {activeTab} listings</h3>
                      <p>
                        {activeTab === 'active'
                          ? 'Post a new listing to start trading.'
                          : `Your ${activeTab} listings will appear here.`}
                      </p>
                      {activeTab === 'active' && (
                        <button className="create-first-btn" onClick={handleCreateListing}>
                          Create Listing
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <span className={`type-badge ${listing.type}`}>{listing.type}</span>
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
                      <span className="rate-text">₦{formatNumber(listing.rate)}</span>
                    </td>
                    <td>
                      <span className="total-text">₦{formatNumber(listing.total)}</span>
                    </td>
                    <td>{getStatusBadge(listing.status)}</td>
                    <td>
                      <span className="date-text">{formatDate(listing.createdAt)}</span>
                    </td>
                    {activeTab === 'active' && (
                      <td>
                        <div className="actions-cell">
                          <button className="action-btn edit" onClick={() => handleEdit(listing)}>
                            Edit
                          </button>
                          {listing.type === 'SELL' && (
                            <button className="action-btn bids" onClick={() => handleOpenReceivedBids(listing.id)}>
                              Bids
                            </button>
                          )}
                          <button className="action-btn delete" onClick={() => handleDelete(listing.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          total={total}
          limit={limit}
          onPageChange={(p) => setCurrentPage(p)}
          isLoading={loading}
        />
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
          onClose={handleCloseCreate}
          onSuccess={() => {
            handleCloseCreate();
            void loadListings();
          }}
          editData={editListing}
        />
      )}
    </div>
  );
};

export default MySabitPage;