import React, { useEffect, useState } from 'react';
import { withdrawalsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';
import { toast } from 'react-toastify';

const WithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Record<string, unknown>[]>([]);
  const [processingId, setProcessingId] = useState<string>('');
 

  useEffect(() => {
    const load = async () => {
      const response = await withdrawalsApi.list();
      if (response.success && Array.isArray(response.data)) {
        setWithdrawals(response.data);
      } else {
        const msg = response.error?.message || 'Failed to load withdrawals';
        toast.error(msg);
      }
    };
    void load();
  }, []);

  const reload = async () => {
    const response = await withdrawalsApi.list();
    if (response.success && Array.isArray(response.data)) {
      setWithdrawals(response.data);
    } else {
      const msg = response.error?.message || 'Failed to load withdrawals';
      toast.error(msg);
    }
  };

  const canActOn = (status: unknown) => {
    const s = String(status || '').toLowerCase();
    return s === 'pending' || s === 'submitted' || s === 'review';
  };

  const handleApprove = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    const res = await withdrawalsApi.approve(withdrawalId);
    setProcessingId('');
    if (!res.success) {
      const msg = res.error?.message || 'Failed to approve withdrawal';
      toast.error(msg);
      return;
    }
    await reload();
  };

  const handleReject = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    const res = await withdrawalsApi.reject(withdrawalId);
    setProcessingId('');
    if (!res.success) {
      const msg = res.error?.message || 'Failed to reject withdrawal';
      toast.error(msg);
      return;
    }
    await reload();
  };

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Withdrawals</h1></div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Amount</th><th>Currency</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {withdrawals.map((withdrawal, index) => (
              <tr key={String(withdrawal.id || index)}>
                <td>{String(withdrawal.id || index)}</td>
                <td>{String(withdrawal.amount || 0)}</td>
                <td>{String(withdrawal.currency || '-')}</td>
                <td>{String(withdrawal.status || '-')}</td>
                <td>
                  {canActOn(withdrawal.status) ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="page-number"
                        disabled={processingId === String(withdrawal.id || index)}
                        onClick={() => void handleApprove(String(withdrawal.id || index))}
                      >
                        Approve
                      </button>
                      <button
                        className="page-number"
                        disabled={processingId === String(withdrawal.id || index)}
                        onClick={() => void handleReject(String(withdrawal.id || index))}
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

export default WithdrawalsPage;
