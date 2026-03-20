import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/TransactionHistory.css';

interface Transaction {
  id: number;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  total: number;
  counterparty: string;
  avatar: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export type TransactionItem = Transaction;

interface TransactionHistoryProps {
  onViewAll?: () => void;
  limit?: number; // Optional prop to limit number of transactions shown
  transactions?: Transaction[];
  loading?: boolean;
  error?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onViewAll,
  limit,
  transactions,
  loading,
  error,
}) => {
  const navigate = useNavigate();
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const displayedTransactions = limit ? safeTransactions.slice(0, limit) : safeTransactions;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      // Default behavior: navigate to history page
      navigate('/dashboard/history');
    }
  };

  if (loading) {
    return (
      <section className="transaction-history-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="view-all-btn" onClick={handleViewAll}>
            View All
          </button>
        </div>
        <p>Loading transactions...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="transaction-history-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="view-all-btn" onClick={handleViewAll}>
            View All
          </button>
        </div>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="transaction-history-section">
      <div className="section-header">
        <h3>Recent Transactions</h3>
        <button className="view-all-btn" onClick={handleViewAll}>
          View All
        </button>
      </div>

      <div className="transaction-list">
        {displayedTransactions.map((tx) => (
          <div key={tx.id} className="transaction-item">
            <div className="transaction-left">
              <img src={tx.avatar} alt={tx.counterparty} className="transaction-avatar" />
              <div className="transaction-info">
                <div className="transaction-main">
                  <span className="counterparty">{tx.counterparty}</span>
                  <span className={`transaction-type ${tx.type}`}>
                    {tx.type === 'buy' ? 'Bought' : 'Sold'}
                  </span>
                </div>
                <div className="transaction-details">
                  <span className="currency-pair">{tx.currency}/NGN</span>
                  <span className="transaction-rate">₦{formatNumber(tx.rate)}</span>
                </div>
              </div>
            </div>

            <div className="transaction-right">
              <div className="transaction-amounts">
                <span className="amount-primary">
                  {tx.type === 'buy' ? '+' : '-'}{tx.currency} {formatNumber(tx.amount)}
                </span>
                <span className="amount-secondary">₦{formatNumber(tx.total)}</span>
              </div>
              <div className="transaction-meta">
                <span className="transaction-date">{formatDate(tx.date)}</span>
                <span className={`status-badge ${tx.status}`}>{tx.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TransactionHistory;