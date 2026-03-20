import React, { useEffect, useState } from 'react';
import { disputesApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await disputesApi.list();
      if (response.success && Array.isArray(response.data)) setDisputes(response.data);
    };
    void load();
  }, []);

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Disputes</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Subject</th><th>Status</th></tr></thead>
          <tbody>
            {disputes.map((dispute, index) => (
              <tr key={String(dispute.id || index)}>
                <td>{String(dispute.id || index)}</td>
                <td>{String(dispute.subject || dispute.title || '-')}</td>
                <td>{String(dispute.status || '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default DisputesPage;
