import React, { useEffect, useState } from 'react';
import { conversionsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const ConversionsPage: React.FC = () => {
  const [conversions, setConversions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await conversionsApi.list();
      if (response.success && Array.isArray(response.data)) setConversions(response.data);
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Conversions</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>From</th><th>To</th><th>Amount</th></tr></thead>
          <tbody>
            {conversions.map((conversion, index) => (
              <tr key={String(conversion.id || index)}>
                <td>{String(conversion.id || index)}</td>
                <td>{String(conversion.fromCurrency || '-')}</td>
                <td>{String(conversion.toCurrency || '-')}</td>
                <td>{String(conversion.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default ConversionsPage;
