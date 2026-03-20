import React, { useEffect, useState } from 'react';
import { depositsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const DepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await depositsApi.list();
      if (response.success && Array.isArray(response.data)) setDeposits(response.data);
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Deposits</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Amount</th><th>Currency</th><th>Status</th></tr></thead>
          <tbody>
            {deposits.map((deposit, index) => (
              <tr key={String(deposit.id || index)}>
                <td>{String(deposit.id || index)}</td>
                <td>{String(deposit.amount || 0)}</td>
                <td>{String(deposit.currency || '-')}</td>
                <td>{String(deposit.status || '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default DepositsPage;
