import React, { useEffect, useState } from 'react';
import { disputesApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';
import { toast } from 'react-toastify';

const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await disputesApi.list();
        if (response.success && Array.isArray(response.data)) {
          setDisputes(response.data);
        } else {
          const msg = response.error?.message || 'Failed to load disputes';
          setError(msg);
        }
      } catch (err: any) {
        setError('An unexpected error occurred while loading disputes');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const reload = async () => {
    try {
      const response = await disputesApi.list();
      if (response.success && Array.isArray(response.data)) {
        setDisputes(response.data);
        setError('');
      } else {
        const msg = response.error?.message || 'Failed to reload disputes';
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred while reloading disputes');
    }
  };

  const getStatus = (status: unknown) => String(status || '').toLowerCase();

  const handleResolve = async (disputeId: string) => {
    setProcessingId(disputeId);
    const res = await disputesApi.resolve(disputeId);
    setProcessingId('');
    if (!res.success) {
      const msg = res.error?.message || 'Failed to resolve dispute';
      toast.error(msg);
      return;
    }
    await reload();
  };

  const handleClose = async (disputeId: string) => {
    setProcessingId(disputeId);
    const res = await disputesApi.close(disputeId);
    setProcessingId('');
    if (!res.success) {
      const msg = res.error?.message || 'Failed to close dispute';
      toast.error(msg);
      return;
    }
    await reload();
  };

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Disputes</h1></div>
      {loading && (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
          <div style={{ marginBottom: 12 }}>Loading disputes...</div>
        </div>
      )}
      {error && (
        <div style={{ padding: '16px', margin: '16px 0', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b' }}>
          {error}
        </div>
      )}
      {!loading && !error && disputes.length === 0 && (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
          No disputes found.
        </div>
      )}
      {!loading && !error && disputes.length > 0 && (
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
      )}
    </main>
  );
};

export default DisputesPage;
