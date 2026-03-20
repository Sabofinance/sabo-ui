import React, { useEffect, useState } from 'react';
import { withdrawalsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const WithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await withdrawalsApi.list();
      if (response.success && Array.isArray(response.data)) setWithdrawals(response.data);
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Withdrawals</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Amount</th><th>Currency</th><th>Status</th></tr></thead>
          <tbody>
            {withdrawals.map((withdrawal, index) => (
              <tr key={String(withdrawal.id || index)}>
                <td>{String(withdrawal.id || index)}</td>
                <td>{String(withdrawal.amount || 0)}</td>
                <td>{String(withdrawal.currency || '-')}</td>
                <td>{String(withdrawal.status || '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default WithdrawalsPage;
