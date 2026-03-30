import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';

type KycRecord = Record<string, unknown>;

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const keys = ['submissions', 'items', 'results', 'rows', 'records', 'list', 'data', 'users', 'transactions', 'deposits', 'disputes'];
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  return [];
};

const AdminKycPage: React.FC = () => {
 
  const [submissions, setSubmissions] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    const res = await adminApi.listKyc();
    console.log('AdminKycPage loadSubmissions res', res);
    if (res.success) {
      const list = extractArray(res.data);
      setSubmissions(Array.isArray(list) ? (list as KycRecord[]) : []);
    } else {
      toast.error(res.error?.message || 'Could not load KYC submissions');
    }
    setLoading(false);
  };

  useEffect(() => { void loadSubmissions(); }, []);

  const onAction = async (id: string, approve: boolean) => {
    setActionLoading(id);
    let res;
    if (approve) res = await adminApi.approveKyc(id);
    else res = await adminApi.rejectKyc(id, 'Not acceptable docs');
    if (!res.success) toast.error(res.error?.message || 'Action failed');
    else toast.success(approve ? 'KYC approved' : 'KYC rejected');
    setActionLoading('');
    void loadSubmissions();
  };

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}><h1>Admin · KYC</h1><p style={{ color: '#5b6774' }}>Review and approve or reject identity submissions.</p></div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
          <thead style={{ background: '#f8fafc' }}><tr><th style={{ padding: 10 }}>ID</th><th style={{ padding: 10 }}>User</th><th style={{ padding: 10 }}>Status</th><th style={{ padding: 10 }}>Document</th><th style={{ padding: 10 }}>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: 12 }}>Loading...</td></tr> : submissions.length === 0 ? <tr><td colSpan={5} style={{ padding: 12 }}>No KYC submissions</td></tr> : submissions.map((k) => {
              const id = String(k.id || k._id || k.kycId || '');
              const status = String(k.status || k.state || 'pending');
              const user = String(k.userEmail || k.email || k.user || '-');
              const doc = String(k.documentNumber || k.document || '-');
              const canReview = /pend|subm|unverified/i.test(status);
              return (
                <tr key={id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: 10 }}>#{id}</td>
                  <td style={{ padding: 10 }}>{user}</td>
                  <td style={{ padding: 10 }}>{status}</td>
                  <td style={{ padding: 10 }}>{doc}</td>
                  <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                    <button disabled={!canReview || actionLoading === id} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#ecfdf3', color: '#065f46' }} onClick={() => void onAction(id, true)}>Approve</button>
                    <button disabled={!canReview || actionLoading === id} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c' }} onClick={() => void onAction(id, false)}>Reject</button>
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

export default AdminKycPage;
