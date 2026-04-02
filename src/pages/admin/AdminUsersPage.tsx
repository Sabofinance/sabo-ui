import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import Pagination from '../../components/Pagination';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  MoreVertical,
  ExternalLink,
  Filter
} from 'lucide-react';

type UserRecord = Record<string, any>;

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const isSuspended = (user: UserRecord) => {
    const status = String(user.status || user.state || (user.isSuspended ? 'suspended' : '') || '').toLowerCase();
    return status.includes('suspend');
  };

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({ page, limit: 10 });
      if (res.success) {
        const list = extractArray(res.data);
        setUsers(Array.isArray(list) ? (list as UserRecord[]) : []);
        const meta = (res.data as any)?.meta || (res.data as any);
        setTotalPages(meta.totalPages || meta.last_page || 1);
        setCurrentPage(page);
      } else {
        toast.error(res.error?.message || 'Could not load users.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(currentPage); }, []);

  const handleToggle = async (id: string, suspended: boolean) => {
    if (!window.confirm(`Are you sure you want to ${suspended ? 'reinstate' : 'suspend'} this user?`)) return;
    
    setActionLoadingId(id);
    try {
      const res = suspended ? await adminApi.reinstateUser(id) : await adminApi.suspendUser(id);
      if (!res.success) {
        toast.error(res.error?.message || 'Action failed');
      } else {
        toast.success(suspended ? 'User reinstated successfully' : 'User suspended successfully');
        void loadUsers(currentPage);
      }
    } finally {
      setActionLoadingId('');
    }
  };

  const filteredUsers = users.filter(u => {
    const email = String(u.email || '').toLowerCase();
    const name = String(u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
    const matchesSearch = email.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'active') return matchesSearch && !isSuspended(u);
    if (statusFilter === 'suspended') return matchesSearch && isSuspended(u);
    return matchesSearch;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => !isSuspended(u)).length,
    suspended: users.filter(u => isSuspended(u)).length
  };

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: '#0A1E28', padding: '10px', borderRadius: '12px', color: '#C8F032' }}>
              <Users size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', fontFamily: 'Bricolage Grotesque', color: '#0A1E28' }}>User Management</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px', fontWeight: '500' }}>Overview of all registered users and their account statuses.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', width: '280px', fontSize: '14px', fontWeight: '500' }}
            />
          </div>
          <button 
            onClick={() => void loadUsers(currentPage)} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Users', value: stats.total, color: '#0A1E28', icon: Users },
          { label: 'Active Users', value: stats.active, color: '#10b981', icon: UserCheck },
          { label: 'Suspended', value: stats.suspended, color: '#ef4444', icon: UserX },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: `${s.color}10`, color: s.color, padding: '12px', borderRadius: '12px' }}><s.icon size={20} /></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        {(['all', 'active', 'suspended'] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            style={{ 
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              background: statusFilter === f ? '#0A1E28' : '#f1f5f9',
              color: statusFilter === f ? '#fff' : '#64748b',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>User</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Role</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>No users found matching your criteria.</td></tr>
            ) : filteredUsers.map((u) => {
              const id = String(u.id || u.userId || u._id || '');
              const suspended = isSuspended(u);
              const name = String(u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User');
              const email = String(u.email || '-');
              const role = String(u.role || 'user');

              return (
                <tr key={id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1E28', fontWeight: '800' }}>
                        {name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#0A1E28' }}>{name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: role === 'admin' ? '#eff6ff' : '#f8fafc', color: role === 'admin' ? '#3b82f6' : '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>
                      <Shield size={14} />
                      {role}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: suspended ? '#fef2f2' : '#ecfdf5', color: suspended ? '#ef4444' : '#10b981', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                      {suspended ? <UserX size={14} /> : <UserCheck size={14} />}
                      {suspended ? 'Suspended' : 'Active'}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link to={`/dashboard/admin/users/${id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ExternalLink size={14} />
                          Details
                        </button>
                      </Link>
                      <button
                        onClick={() => void handleToggle(id, suspended)}
                        disabled={actionLoadingId === id}
                        style={{ 
                          padding: '8px 16px', borderRadius: '10px', border: 'none', 
                          background: suspended ? '#10b981' : '#ef4444', 
                          color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                          opacity: actionLoadingId === id ? 0.7 : 1,
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        {actionLoadingId === id ? <RefreshCw size={14} className="animate-spin" /> : suspended ? <UserCheck size={14} /> : <UserX size={14} />}
                        {actionLoadingId === id ? 'Updating...' : suspended ? 'Reinstate' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={(p) => void loadUsers(p)} 
          isLoading={loading} 
        />
      </div>
    </main>
  );
};

export default AdminUsersPage;
