import React, { useEffect, useState } from 'react';
import { tradesApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const TradesPage: React.FC = () => {
  const [trades, setTrades] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await tradesApi.list();
      if (response.success && Array.isArray(response.data)) setTrades(response.data);
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Trades</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Pair</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr key={String(trade.id || index)}>
                <td>{String(trade.id || index)}</td>
                <td>{String(trade.pair || `${String(trade.base || '-')}/${String(trade.quote || '-')}`)}</td>
                <td>{String(trade.amount || 0)}</td>
                <td>{String(trade.status || '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default TradesPage;
