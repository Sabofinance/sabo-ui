import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';

type UserRecord = Record<string, unknown>;

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const keys = ['users', 'items', 'results', 'rows', 'records', 'list', 'data', 'transactions', 'submissions', 'deposits', 'disputes'];
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  return [];
};

const AdminUsersPage: React.FC = () => {
 
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');

  const isSuspended = (user: UserRecord) => {
    const status = String(user.status || user.state || (user.isSuspended ? 'suspended' : '') || '').toLowerCase();
    return status.includes('suspend');
  };

  const loadUsers = async () => {
    setLoading(true);
    const res = await adminApi.listUsers();
    console.log('AdminUsersPage loadUsers res', res);
    if (res.success) {
      const list = extractArray(res.data);
      setUsers(Array.isArray(list) ? (list as UserRecord[]) : []);
    } else {
      toast.error(res.error?.message || 'Could not load users.');
    }
    setLoading(false);
  };

  useEffect(() => { void loadUsers(); }, []);

  const handleToggle = async (id: string, suspended: boolean) => {
    setActionLoadingId(id);
    const res = suspended ? await adminApi.reinstateUser(id) : await adminApi.suspendUser(id);
    if (!res.success) toast.error(res.error?.message || 'Action failed');
    else toast.success(suspended ? 'Reinstated' : 'Suspended');
    setActionLoadingId('');
    void loadUsers();
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !isSuspended(u)).length;
  const suspendedUsers = totalUsers - activeUsers;

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin - Users</h1>
          <p style={{ margin: 0, color: '#5b6774' }}>Manage user accounts and suspend/reinstate access.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontWeight: 700 }}>Total: {totalUsers}</span>
          <span style={{ color: '#16a34a' }}>Active: {activeUsers}</span>
          <span style={{ color: '#dc2626' }}>Suspended: {suspendedUsers}</span>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: 10, borderBottom: '1px solid #edf2f7' }}>Name</th>
              <th style={{ padding: 10, borderBottom: '1px solid #edf2f7' }}>Email</th>
              <th style={{ padding: 10, borderBottom: '1px solid #edf2f7' }}>Role</th>
              <th style={{ padding: 10, borderBottom: '1px solid #edf2f7' }}>Status</th>
              <th style={{ padding: 10, borderBottom: '1px solid #edf2f7' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 14 }}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 14 }}>No users found.</td></tr>
            ) : users.map((u) => {
              const id = String(u.id || u.userId || u._id || '');
              const suspended = isSuspended(u);
              const name = String(u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown');
              const email = String(u.email || '-');
              const role = String(u.role || 'user');
              return (
                <tr key={id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: 10 }}>{name}</td>
                  <td style={{ padding: 10 }}>{email}</td>
                  <td style={{ padding: 10, textTransform: 'capitalize' }}>{role}</td>
                  <td style={{ padding: 10 }}><strong style={{ color: suspended ? '#dc2626' : '#16a34a' }}>{suspended ? 'Suspended' : 'Active'}</strong></td>
                  <td style={{ padding: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Link to={`/dashboard/admin/users/${id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>View</button>
                    </Link>
                    <button
                      style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: suspended ? '#16a34a' : '#dc2626', color: '#fff', cursor: 'pointer' }}
                      disabled={actionLoadingId === id}
                      onClick={() => void handleToggle(id, suspended)}
                    >{actionLoadingId === id ? 'Updating...' : suspended ? 'Reinstate' : 'Suspend'}</button>
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

export default AdminUsersPage;
