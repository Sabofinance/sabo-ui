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

interface TransactionHistoryProps {
  onViewAll?: () => void;
  limit?: number; // Optional prop to limit number of transactions shown
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onViewAll, limit }) => {
  const navigate = useNavigate();

  const transactions: Transaction[] = [
    {
      id: 1,
      type: 'buy',
      currency: 'GBP',
      amount: 500,
      rate: 1650,
      total: 825000,
      counterparty: 'Sarah.eth',
      avatar: 'https://i.pravatar.cc/150?u=2',
      date: '2024-03-15T10:30:00',
      status: 'completed'
    },
    {
      id: 2,
      type: 'sell',
      currency: 'NGN',
      amount: 2500,
      rate: 1580,
      total: 3950000,
      counterparty: 'MikeCrypto',
      avatar: 'https://i.pravatar.cc/150?u=3',
      date: '2024-03-14T15:45:00',
      status: 'completed'
    },
    {
      id: 3,
      type: 'buy',
      currency: 'GBP',
      amount: 300,
      rate: 1680,
      total: 504000,
      counterparty: 'EmmaTrades',
      avatar: 'https://i.pravatar.cc/150?u=4',
      date: '2024-03-13T09:15:00',
      status: 'completed'
    }
  ];

  // Apply limit if provided, otherwise show all transactions
  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

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