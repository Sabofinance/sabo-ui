import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../lib/api';

type AdminRec = Record<string, unknown>;

const AdminAdminsPage: React.FC = () => {
  const toast = useToast();
  const [admins, setAdmins] = useState<AdminRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await adminApi.listAdmins();
    if (res.success && Array.isArray(res.data)) setAdmins(res.data as AdminRec[]);
    else toast.error(res.error?.message || 'Could not load admins');
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const handlePromote = async (id: string) => {
    setActionLoadingId(id);
    const res = await adminApi.promoteUser(id);
    if (!res.success) toast.error(res.error?.message || 'Promote failed');
    else toast.success('User promoted');
    setActionLoadingId('');
    void load();
  };

  const handleDemote = async (id: string) => {
    setActionLoadingId(id);
    const res = await adminApi.demoteAdmin(id);
    if (!res.success) toast.error(res.error?.message || 'Demote failed');
    else toast.success('Admin demoted');
    setActionLoadingId('');
    void load();
  };

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}><h1>Admin · Admins</h1><p style={{ color: '#5b6774' }}>Manage admin-level access (super_admin only).</p></div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ background: '#f8fafc' }}><tr><th style={{ padding: 10 }}>ID</th><th style={{ padding: 10 }}>Email</th><th style={{ padding: 10 }}>Role</th><th style={{ padding: 10 }}>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ padding: 12 }}>Loading...</td></tr> : admins.length === 0 ? <tr><td colSpan={4} style={{ padding: 12 }}>No admin accounts found.</td></tr> : admins.map((a) => {
              const id = String(a.id || a._id || '');
              const role = String(a.role || 'admin');
              const email = String(a.email || a.userEmail || '-');
              const isSuper = role.toLowerCase() === 'super_admin';
              return (
                <tr key={id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: 10 }}>#{id}</td>
                  <td style={{ padding: 10 }}>{email}</td>
                  <td style={{ padding: 10 }}>{role}</td>
                  <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                    {!isSuper ? <button disabled={actionLoadingId === id} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#ecfdf3', color: '#065f46' }} onClick={() => void handlePromote(id)}>{actionLoadingId === id ? '...' : 'Promote'}</button> : <button disabled style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', color: '#6b7280' }}>Super Admin</button>}
                    {isSuper && <button disabled={actionLoadingId === id} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c' }} onClick={() => void handleDemote(id)}>{actionLoadingId === id ? '...' : 'Demote'}</button>}
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

export default AdminAdminsPage;
