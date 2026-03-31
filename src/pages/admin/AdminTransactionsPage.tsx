import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    const res = await adminApi.listTransactions();
    if (res.success && Array.isArray(res.data)) setTransactions(res.data);
    else if (res.success && res.data && Array.isArray((res.data as any).data)) setTransactions((res.data as any).data);
    else toast.error('Failed to load transactions');
    setLoading(false);
  };

  useEffect(() => { void loadTransactions(); }, []);

  const formatAmount = (val: any) => new Intl.NumberFormat('en-NG').format(Number(val || 0));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Transactions</h1>
        <p style={{ color: '#6b7a99' }}>Full ledger of all system transactions.</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e8f0', borderRadius: 20, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
    </div>
  );
};

export default AdminTransactionsPage;