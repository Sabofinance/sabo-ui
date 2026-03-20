import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../lib/api';

type UserRecord = Record<string, unknown>;

const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      const res = await adminApi.getUserById(id);
      if (res.success && res.data) {
        setUser(res.data as UserRecord);
      } else {
        toast.error(res.error?.message || 'User not found');
      }
      setLoading(false);
    };
    void fetchUser();
  }, [id, toast]);

  if (!id) return <main style={{ padding: 16 }}><h1>Missing user ID</h1></main>;
  if (loading || !user) return <main style={{ padding: 16 }}><h1>Loading user details...</h1></main>;

  const fields = {
    'ID': String(user.id || user.userId || user._id || '-'),
    'Name': String(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'),
    'Email': String(user.email || '-'),
    'Role': String(user.role || 'user'),
    'Phone': String(user.phone || user.phoneNumber || '-'),
    'Status': String(user.status || user.state || (user.isSuspended ? 'suspended' : 'active') || '-'),
    'Created At': String(user.createdAt || user.created_at || '-'),
  };

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 14 }}><h1>Admin · User Details</h1><p style={{ color: '#5b6774' }}>Detail view and raw profile data for the user.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {Object.entries(fields).map(([label, value]) => (
          <div key={label} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Raw JSON</div>
        <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, overflowX: 'auto' }}>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </main>
  );
};

export default AdminUserDetailsPage;
