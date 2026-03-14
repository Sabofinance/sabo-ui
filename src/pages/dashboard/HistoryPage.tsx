import React, { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardSidebar from '../../components/DashboardSidebar';
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
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const transactions: Transaction[] = [
    {
      id: 1,
      type: 'sell',
      currency: 'GBP',
      amount: 5000,
      rate: 1650,
      total: 8250000,
      counterparty: {
        name: 'CryptoKing',
        avatar: 'https://i.pravatar.cc/150?u=5',
        verified: true
      },
      status: 'completed',
      date: '2024-03-15T10:30:00',
      reference: 'TXN-2024-001'
    },
    {
      id: 2,
      type: 'buy',
      currency: 'NGN',
      amount: 2500000,
      rate: 1580,
      total: 3950000,
      counterparty: {
        name: 'FXTrader',
        avatar: 'https://i.pravatar.cc/150?u=6',
        verified: true
      },
      status: 'completed',
      date: '2024-03-14T15:45:00',
      reference: 'TXN-2024-002'
    },
    {
      id: 3,
      type: 'sell',
      currency: 'USD',
      amount: 10000,
      rate: 1550,
      total: 15500000,
      counterparty: {
        name: 'SabiTrader',
        avatar: 'https://i.pravatar.cc/150?u=7',
        verified: true
      },
      status: 'completed',
      date: '2024-03-13T09:15:00',
      reference: 'TXN-2024-003'
    },
    {
      id: 4,
      type: 'buy',
      currency: 'GBP',
      amount: 3000,
      rate: 1640,
      total: 4920000,
      counterparty: {
        name: 'NaijaPounds',
        avatar: 'https://i.pravatar.cc/150?u=8',
        verified: false
      },
      status: 'pending',
      date: '2024-03-12T11:20:00',
      reference: 'TXN-2024-004'
    },
    {
      id: 5,
      type: 'sell',
      currency: 'EUR',
      amount: 8000,
      rate: 1720,
      total: 13760000,
      counterparty: {
        name: 'EuroMaster',
        avatar: 'https://i.pravatar.cc/150?u=9',
        verified: true
      },
      status: 'completed',
      date: '2024-03-11T14:30:00',
      reference: 'TXN-2024-005'
    }
  ];

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
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    
    if (dateFilter !== 'all') {
      const txDate = new Date(tx.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today' && daysDiff > 1) return false;
      if (dateFilter === 'week' && daysDiff > 7) return false;
      if (dateFilter === 'month' && daysDiff > 30) return false;
    }
    
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
    <div className="dashboard-wrapper">
      <DashboardSidebar />
      
      <div className="main-content">
        <DashboardHeader />
        
        <main className="history-page">
          <div className="page-header">
            <div>
              <h1 className="page-title">Transaction History</h1>
              <p className="page-subtitle">View all your past transactions</p>
            </div>
            
            <button className="export-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Report
            </button>
          </div>

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
              <label>Date Range</label>
              <select 
                className="filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Transaction Type</label>
              <select 
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="buy">Buy Orders</option>
                <option value="sell">Sell Orders</option>
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

          {/* Pagination with Visible Arrows */}
          <div className="pagination">
            <button className="page-arrow">‹</button>
            <button className="page-number active">1</button>
            <button className="page-number">2</button>
            <button className="page-number">3</button>
            <span className="page-dots">...</span>
            <button className="page-number">8</button>
            <button className="page-arrow">›</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;