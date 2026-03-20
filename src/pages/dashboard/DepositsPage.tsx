import React, { useEffect, useState } from 'react';
import { depositsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';
import { useToast } from '../../context/ToastContext';

const DepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<Record<string, unknown>[]>([]);
  const [processingId, setProcessingId] = useState<string>('');
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      const response = await depositsApi.list();
      if (response.success && Array.isArray(response.data)) {
        setDeposits(response.data);
      } else {
        const msg = response.error?.message || 'Failed to load deposits';
        toast.error(msg);
      }
    };
    void load();
  }, []);

  const reload = async () => {
    const response = await depositsApi.list();
    if (response.success && Array.isArray(response.data)) {
      setDeposits(response.data);
    } else {
      const msg = response.error?.message || 'Failed to load deposits';
      toast.error(msg);
    }
  };

  const canActOn = (status: unknown) => {
    const s = String(status || '').toLowerCase();
    return s === 'pending' || s === 'submitted' || s === 'review';
  };

  const handleApprove = async (depositId: string) => {
    setProcessingId(depositId);
    const res = await depositsApi.approve(depositId);
    setProcessingId('');
    if (!res.success) {
      const msg = res.error?.message || 'Failed to approve deposit';
      toast.error(msg);
      return;
    }
    await reload();
  };

  const handleReject = async (depositId: string) => {
    setProcessingId(depositId);
    const res = await depositsApi.reject(depositId);
    setProcessingId('');
    if (!res.success) {
      const msg = res.error?.message || 'Failed to reject deposit';
      toast.error(msg);
      return;
    }
    await reload();
  };

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Deposits</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Amount</th><th>Currency</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {deposits.map((deposit, index) => (
              <tr key={String(deposit.id || index)}>
                <td>{String(deposit.id || index)}</td>
                <td>{String(deposit.amount || 0)}</td>
                <td>{String(deposit.currency || '-')}</td>
                <td>{String(deposit.status || '-')}</td>
                <td>
                  {canActOn(deposit.status) ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="page-number"
                        disabled={processingId === String(deposit.id || index)}
                        onClick={() => void handleApprove(String(deposit.id || index))}
                      >
                        Approve
                      </button>
                      <button
                        className="page-number"
                        disabled={processingId === String(deposit.id || index)}
                        onClick={() => void handleReject(String(deposit.id || index))}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: '#64748B' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  );
};

export default DepositsPage;
