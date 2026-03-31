import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';

type AdminRec = Record<string, unknown>;

const AdminAdminsPage: React.FC = () => {
 
  const [admins, setAdmins] = useState<AdminRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminApi.listAdmins();
    if (res.success && Array.isArray(res.data)) setAdmins(res.data as AdminRec[]);
    else toast.error(res.error?.message || 'Could not load admins');
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await adminApi.createInvite(inviteEmail);
      if (res.success) {
        toast.success('Admin invite sent to ' + inviteEmail);
        setInviteEmail('');
      } else {
        toast.error(res.error?.message || 'Failed to send invite');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this admin?')) return;
    setActionLoadingId(id);
    const res = await adminApi.removeAdmin(id);
    if (!res.success) toast.error(res.error?.message || 'Remove failed');
    else {
      toast.success('Admin removed');
      void load();
    }
    setActionLoadingId('');
  };

  const handleUpgrade = async (id: string) => {
    if (!window.confirm('Upgrade to Super Admin?')) return;
    setActionLoadingId(id);
    const res = await adminApi.upgradeAdmin(id);
    if (!res.success) toast.error(res.error?.message || 'Upgrade failed');
    else {
      toast.success('Admin upgraded');
      void load();
    }
    setActionLoadingId('');
  };

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}><h1>Admin · Admins</h1><p style={{ color: '#5b6774' }}>Manage admin-level access (super_admin only).</p></div>
      
      <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Invite New Admin</h3>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10 }}>
          <input 
            type="email" 
            placeholder="Enter email address" 
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
          <button 
            type="submit" 
            disabled={inviting}
            style={{ padding: '10px 24px', background: '#C8F032', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
          >
            {inviting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

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
                    {!isSuper && (
                      <button 
                        disabled={actionLoadingId === id} 
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#ecfdf3', color: '#065f46', cursor: 'pointer' }} 
                        onClick={() => void handleUpgrade(id)}
                      >
                        {actionLoadingId === id ? '...' : 'Upgrade'}
                      </button>
                    )}
                    <button 
                      disabled={actionLoadingId === id} 
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }} 
                      onClick={() => void handleRemove(id)}
                    >
                      {actionLoadingId === id ? '...' : 'Remove'}
                    </button>
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
