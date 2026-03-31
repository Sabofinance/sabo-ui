import React, { useEffect, useState } from 'react';
import { depositsApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import '../../assets/css/HistoryPage.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DepositsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const response = await depositsApi.list();
      if (response.success) {
        setDeposits(extractArray(response.data));
      } else {
        const msg = response.error?.message || 'Failed to load deposits';
        setError(msg);
        toast.error(msg);
      }
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposits</h1>
          <p className="page-subtitle">View your deposit history</p>
        </div>
        <button className="export-btn" style={{ background: '#C8F032', color: '#0A1E28' }} onClick={() => navigate('/dashboard/deposit')}>
          Make a deposit
        </button>
      </div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Currency</th><th>Amount</th><th>Provider</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 16, color: '#6b7280' }}>Loading deposits...</td></tr>
            ) : error ? (
              <tr><td colSpan={6} style={{ padding: 16, color: '#e74c3c' }}>{error}</td></tr>
            ) : deposits.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 16, color: '#6b7280' }}>No deposits yet.</td></tr>
            ) : (
              deposits.map((deposit, index) => {
                const id = String((deposit as any).id || (deposit as any)._id || index);
                const currency = String((deposit as any).currency || '-');
                const amount = Number((deposit as any).amount || 0);
                const provider = String((deposit as any).provider || (deposit as any).gateway || '-');
                const status = String((deposit as any).status || '-');
                const dateRaw = String((deposit as any).createdAt || (deposit as any).date || '');
                return (
                  <tr
                    key={id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/deposits/${id}`)}
                  >
                    <td>{id}</td>
                    <td>{currency}</td>
                    <td>{new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}</td>
                    <td>{provider}</td>
                    <td>{status}</td>
                    <td>{dateRaw ? new Date(dateRaw).toLocaleString() : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </main>
  );
};

export default DepositsPage;
