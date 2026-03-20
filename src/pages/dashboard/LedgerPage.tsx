import React, { useEffect, useState } from 'react';
import { ledgerApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const LedgerPage: React.FC = () => {
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await ledgerApi.listEntries();
      if (response.success && Array.isArray(response.data)) setEntries(response.data);
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Ledger</h1></div>
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
    </main>
  );
};

export default LedgerPage;
