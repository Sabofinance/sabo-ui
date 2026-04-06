import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import Pagination from '../../components/Pagination';

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadTransactions = async (page = 1) => {
    setLoading(true);
    const res = await adminApi.listTransactions({ page, limit: 20 });
    if (res.success) {
      const data = res.data as any;
      const list = Array.isArray(data) ? data : data.data || [];
      setTransactions(list);
      const meta = data.meta || data;
      setTotalPages(meta.totalPages || meta.last_page || 1);
      setCurrentPage(page);
    } else {
      toast.error('Failed to load transactions');
    }
    setLoading(false);
  };

  useEffect(() => { void loadTransactions(currentPage); }, []);

  const formatAmount = (val: any) => new Intl.NumberFormat('en-NG').format(Number(val || 0));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Transactions</h1>
          <p style={{ color: '#6b7a99', marginTop: 4 }}>Full ledger of all system transactions.</p>
        </div>
        <button 
          onClick={() => void loadTransactions(currentPage)} 
          disabled={loading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 20px', 
            borderRadius: '99px', 
            border: '1.5px solid #e3e8f0', 
            background: '#fff', 
            color: '#0d1829', 
            fontSize: '13px', 
            fontWeight: '600', 
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(13,24,41,.06)',
            transition: 'all .15s'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e8f0', borderRadius: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead style={{ background: '#f4f6f9' }}>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Reference</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Currency</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#6b7a99' }}>Loading transactions...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#6b7a99' }}>No transactions found.</td></tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={tx.id || idx} style={{ borderBottom: '1px solid #e3e8f0' }}>
                  <td style={{ padding: 16, fontFamily: 'monospace' }}>#{tx.reference || tx.id}</td>
                  <td style={{ padding: 16, fontSize: 13 }}>{new Date(tx.createdAt || tx.date).toLocaleString()}</td>
                  <td style={{ padding: 16, textTransform: 'capitalize' }}>{tx.type}</td>
                  <td style={{ padding: 16, fontWeight: 700 }}>{formatAmount(tx.amount || tx.total)}</td>
                  <td style={{ padding: 16 }}><span style={{ padding: '4px 8px', background: '#f4f6f9', borderRadius: 6, fontSize: 11 }}>{tx.currency}</span></td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: 99, 
                      fontSize: 11, 
                      fontWeight: 700, 
                      background: tx.status === 'completed' ? '#dcfce7' : tx.status === 'pending' ? '#fef3c7' : '#fee2e2',
                      color: tx.status === 'completed' ? '#16a34a' : tx.status === 'pending' ? '#d97706' : '#dc2626'
                    }}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(p) => void loadTransactions(p)} 
        isLoading={loading} 
      />
    </div>
  );
};

export default AdminTransactionsPage;