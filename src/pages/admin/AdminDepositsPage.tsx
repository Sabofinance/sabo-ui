import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';

type DepositRecord = Record<string, unknown>;

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const keys = ['deposits', 'items', 'results', 'rows', 'records', 'list', 'data', 'users', 'transactions', 'submissions', 'disputes'];
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  return [];
};

const AdminDepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await adminApi.listDeposits({ status: 'pending' });
    console.log('AdminDepositsPage load res', res);
    if (res.success) {
      const list = extractArray(res.data);
      setDeposits(Array.isArray(list) ? (list as DepositRecord[]) : []);
    } else {
      toast.error(res.error?.message || 'Could not load deposits');
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const onAction = async (id: string, approve: boolean) => {
    setActionLoading(id);
    const res = approve ? await adminApi.approveDeposit(id) : await adminApi.rejectDeposit(id, 'Manual reject');
    if (!res.success) toast.error(res.error?.message || 'Action failed');
    else toast.success(approve ? 'Deposit approved' : 'Deposit rejected');
    setActionLoading('');
    void load();
  };

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}><h1>Admin · Deposits</h1><p style={{ color: '#5b6774' }}>Approve or reject pending deposits.</p></div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ background: '#f8fafc' }}><tr><th style={{ padding: 10 }}>ID</th><th style={{ padding: 10 }}>User</th><th style={{ padding: 10 }}>Amount</th><th style={{ padding: 10 }}>Status</th><th style={{ padding: 10 }}>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: 12 }}>Loading...</td></tr> : deposits.length === 0 ? <tr><td colSpan={5} style={{ padding: 12 }}>No pending deposits</td></tr> : deposits.map((d) => {
              const id = String(d.id || d._id || '');
              return (
                <tr key={id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: 10 }}>#{id}</td>
                  <td style={{ padding: 10 }}>{String(d.userEmail || d.email || d.user || '-')}</td>
                  <td style={{ padding: 10 }}>{String(d.amount || d.value || '0')}</td>
                  <td style={{ padding: 10 }}>{String(d.status || 'pending')}</td>
                  <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                    <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#ecfdf3', color: '#065f46' }} disabled={actionLoading === id} onClick={() => void onAction(id, true)}>{actionLoading === id ? '...' : 'Approve'}</button>
                    <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c' }} disabled={actionLoading === id} onClick={() => void onAction(id, false)}>{actionLoading === id ? '...' : 'Reject'}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AdminDepositsPage;
