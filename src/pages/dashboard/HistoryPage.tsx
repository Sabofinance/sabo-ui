import React, { useEffect, useState } from 'react';
import { ledgerApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import '../../assets/css/HistoryPage.css';

interface Transaction {
  id: number;
  type: 'buy' | 'sell';
  currency: 'NGN' | 'GBP' | 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  counterparty: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  reference: string;
}

const HistoryPage: React.FC = () => {
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const loadLedger = async () => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, unknown> = { page, limit };
        if (from) params.from = new Date(from).toISOString();
        if (to) params.to = new Date(to).toISOString();
        if (typeFilter !== 'all') params.type = typeFilter;
        if (currencyFilter !== 'all') params.currency = currencyFilter;

        const response = await ledgerApi.listEntries(params);
        if (response.success) {
          const ledgerList = extractArray(response.data);
          const mapped: Transaction[] = ledgerList.map((entry: Record<string, unknown>, index: number) => ({
            id: Number(entry.id || index + 1),
            type: (String(entry.type || 'buy').toLowerCase() === 'sell' ? 'sell' : 'buy') as Transaction['type'],
            currency: (String(entry.currency || 'NGN') as Transaction['currency']),
            amount: Number(entry.amount || 0),
            rate: Number(entry.rate || 0),
            total: Number(entry.total || entry.value || 0),
            counterparty: {
              name: String(entry.counterpartyName || (entry.counterparty as any)?.name || 'Unknown Trader'),
              avatar: String(entry.counterpartyAvatar || (entry.counterparty as any)?.avatar || `https://i.pravatar.cc/150?u=${index}`),
              verified: Boolean(entry.verified ?? (entry.counterparty as any)?.verified ?? false),
            },
            status: (String(entry.status || 'completed').toLowerCase() as Transaction['status']),
            date: String(entry.date || entry.createdAt || new Date().toISOString()),
            // Reference must come from API fields; avoid generating random fallbacks.
            reference: String(entry.reference ?? entry.id ?? ''),
          }));
          setTransactions(mapped);
          setHasNext(mapped.length === limit);
        } else if (!response.success) {
          setError(response.error?.message || 'Failed to load transaction history');
        }
      } catch (err: any) {
        setError('An unexpected error occurred while loading your history');
      } finally {
        setLoading(false);
      }
    };

    void loadLedger();
  }, [from, to, typeFilter, currencyFilter, page, limit]);

  const handleExport = () => {
    if (transactions.length === 0) return;
    
    const headers = ['Date', 'Reference', 'Type', 'Counterparty', 'Currency', 'Amount', 'Rate', 'Total', 'Status'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        new Date(tx.date).toLocaleDateString(),
        tx.reference,
        tx.type.toUpperCase(),
        tx.counterparty.name,
        tx.currency,
        tx.amount,
        tx.rate,
        tx.total,
        tx.status.toUpperCase()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sabo_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.counterparty.name.toLowerCase().includes(searchLower) ||
        tx.reference.toLowerCase().includes(searchLower) ||
        tx.currency.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const totalVolume = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <main className="history-page">
            <div className="page-header">
              <div>
                <h1 className="page-title">Transaction History</h1>
                <p className="page-subtitle">View all your past transactions</p>
              </div>
              
              <button className="export-btn" onClick={handleExport} disabled={transactions.length === 0}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export Report
              </button>
            </div>

            {loading ? (
              <div className="loading-state" style={{ padding: '4rem', textAlign: 'center' }}>
                <p>Loading transaction history...</p>
              </div>
            ) : error ? (
              <div className="error-state" style={{ padding: '4rem', textAlign: 'center', color: '#e74c3c' }}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', color: '#C8F032', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Try again</button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
                <p>No transactions found. Your activity will appear here once you start trading.</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-icon total">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Total Volume</span>
                  <span className="summary-value">₦{formatNumber(totalVolume)}</span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon completed">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Completed</span>
                  <span className="summary-value">{completedCount}</span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon pending">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Pending</span>
                  <span className="summary-value">{pendingCount}</span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon success">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Success Rate</span>
                  <span className="summary-value">
                    {Math.round((completedCount / transactions.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <label>From</label>
                <input
                  className="filter-select"
                  type="date"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                />
              </div>

              <div className="filter-group">
                <label>To</label>
                <input
                  className="filter-select"
                  type="date"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setPage(1); }}
                />
              </div>

              <div className="filter-group">
                <label>Type</label>
                <select 
                  className="filter-select"
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                >
                  <option value="all">All Types</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Currency</label>
                <select
                  className="filter-select"
                  value={currencyFilter}
                  onChange={(e) => { setCurrencyFilter(e.target.value); setPage(1); }}
                >
                  <option value="all">All</option>
                  <option value="NGN">NGN</option>
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div className="filter-search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by trader or reference..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date & Time</th>
                    <th>Trader</th>
                    <th>Type</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Rate</th>
                    <th>Total Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <span className="reference-cell">{tx.reference}</span>
                      </td>
                      <td>
                        <span className="date-cell">{formatDate(tx.date)}</span>
                      </td>
                      <td>
                        <div className="trader-cell">
                          <img src={tx.counterparty.avatar} alt="" className="trader-avatar" />
                          <div>
                            <div className="trader-name-row">
                              <span className="trader-name">{tx.counterparty.name}</span>
                              {tx.counterparty.verified && (
                                <svg className="verified-badge" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8F032" strokeWidth="2.5">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${tx.type}`}>
                          {tx.type === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td>
                        <span className="currency-cell">{tx.currency}</span>
                      </td>
                      <td>
                        <span className="amount-cell">
                          {getCurrencySymbol(tx.currency)}{formatNumber(tx.amount)}
                        </span>
                      </td>
                      <td>
                        <span className="rate-cell">₦{formatNumber(tx.rate)}</span>
                      </td>
                      <td>
                        <span className="total-cell">₦{formatNumber(tx.total)}</span>
                      </td>
                      <td>
                        {getStatusBadge(tx.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <div className="no-results">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <h3>No transactions found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="page-arrow" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
              <button className="page-number active">{page}</button>
              <button className="page-arrow" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          </>
        )}
    </main>
  );
};

export default HistoryPage;