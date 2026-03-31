import React, { useEffect, useState } from 'react';
import { ledgerApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import '../../assets/css/HistoryPage.css';

const LedgerPage: React.FC = () => {
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await ledgerApi.listEntries();
        if (response.success) {
          setEntries(extractArray(response.data));
        } else {
          setError(response.error?.message || 'Failed to load ledger entries');
          setEntries([]);
        }
      } catch (err: any) {
        setError('An unexpected error occurred while loading ledger');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Ledger</h1></div>
      {loading && (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
          <div style={{ marginBottom: 12 }}>Loading ledger entries...</div>
        </div>
      )}
      {error && (
        <div style={{ padding: '16px', margin: '16px 0', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b' }}>
          {error}
        </div>
      )}
      {!loading && !error && entries.length === 0 && (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
          No ledger entries found.
        </div>
      )}
      {!loading && !error && entries.length > 0 && (
        <div className="history-table-container">
          <table className="history-table">
            <thead><tr><th>Reference</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={String(entry.id || index)}>
                  <td>{String(entry.reference || '-')}</td>
                  <td>{String(entry.type || '-')}</td>
                  <td>{String(entry.amount || 0)}</td>
                  <td>{String(entry.status || '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default LedgerPage;
