import React, { useEffect, useState } from 'react';
import { disputesApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const response = await disputesApi.list();
      if (response.success && Array.isArray(response.data)) {
        setDisputes(response.data);
        setError('');
      } else {
        setError(response.error?.message || 'Failed to load disputes');
      }
    };
    void load();
  }, []);

  const reload = async () => {
    const response = await disputesApi.list();
    if (response.success && Array.isArray(response.data)) {
      setDisputes(response.data);
    } else {
      setError(response.error?.message || 'Failed to load disputes');
    }
  };

  const getStatus = (status: unknown) => String(status || '').toLowerCase();

  const handleResolve = async (disputeId: string) => {
    setProcessingId(disputeId);
    setError('');
    const res = await disputesApi.resolve(disputeId);
    setProcessingId('');
    if (!res.success) {
      setError(res.error?.message || 'Failed to resolve dispute');
      return;
    }
    await reload();
  };

  const handleClose = async (disputeId: string) => {
    setProcessingId(disputeId);
    setError('');
    const res = await disputesApi.close(disputeId);
    setProcessingId('');
    if (!res.success) {
      setError(res.error?.message || 'Failed to close dispute');
      return;
    }
    await reload();
  };

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Disputes</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Subject</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {disputes.map((dispute, index) => (
              <tr key={String(dispute.id || index)}>
                <td>{String(dispute.id || index)}</td>
                <td>{String(dispute.subject || dispute.title || '-')}</td>
                <td>{String(dispute.status || '-')}</td>
                <td>
                  {(() => {
                    const status = getStatus(dispute.status);
                    const canResolve = status === 'pending' || status === 'open' || status === 'submitted';
                    const canClose = status !== 'closed' && status !== 'resolved';
                    return (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canResolve && (
                          <button
                            className="page-number"
                            disabled={processingId === String(dispute.id || index)}
                            onClick={() => void handleResolve(String(dispute.id || index))}
                          >
                            Resolve
                          </button>
                        )}
                        {canClose && (
                          <button
                            className="page-number"
                            disabled={processingId === String(dispute.id || index)}
                            onClick={() => void handleClose(String(dispute.id || index))}
                          >
                            Close
                          </button>
                        )}
                        {!canResolve && !canClose && <span style={{ color: '#64748B' }}>—</span>}
                      </div>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p style={{ marginTop: '1rem', color: '#c62828', textAlign: 'center' }}>{error}</p>}
    </main>
  );
};

export default DisputesPage;
