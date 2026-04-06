import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import Pagination from '../../components/Pagination';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  ArrowUpCircle,
  RefreshCw,
  Search,
  Lock
} from 'lucide-react';

type AdminRec = Record<string, any>;

const AdminAdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error404, setError404] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    setError404(false);
    try {
      const res = await adminApi.listAdmins({ page, limit: 10 });
      if (res.success) {
        const data = res.data as any;
        // Support { admins: [...] } or { data: [...] } or [...]
        const list = data.admins || (Array.isArray(data) ? data : data.data || []);
        setAdmins(list as AdminRec[]);
        const meta = data.meta || data;
        setTotalPages(meta.totalPages || meta.last_page || 1);
        setCurrentPage(page);
      } else {
        if (res.error?.code === 'NOT_FOUND' || res.status === 404) {
          setError404(true);
        }
        toast.error(res.error?.message || 'Could not load admins');
      }
    } catch (err: any) {
      if (err.response?.status === 404) setError404(true);
      toast.error('Failed to connect to admin management endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(currentPage); }, []);

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
    if (!window.confirm('Are you sure you want to remove this admin? This will revoke all administrative access.')) return;
    setActionLoadingId(id);
    try {
      const res = await adminApi.removeAdmin(id);
      if (res.success) {
        toast.success('Admin access revoked');
        void load(currentPage);
      } else {
        toast.error(res.error?.message || 'Remove failed');
      }
    } finally {
      setActionLoadingId('');
    }
  };

  const handleUpgrade = async (id: string) => {
    if (!window.confirm('Upgrade this account to Super Admin status?')) return;
    setActionLoadingId(id);
    try {
      const res = await adminApi.upgradeAdmin(id);
      if (res.success) {
        toast.success('Admin upgraded to Super Admin');
        void load(currentPage);
      } else {
        toast.error(res.error?.message || 'Upgrade failed');
      }
    } finally {
      setActionLoadingId('');
    }
  };

  if (error404) {
    return (
      <main style={{ padding: '60px 32px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#fef2f2', padding: '40px', borderRadius: '32px', border: '1px solid #fee2e2' }}>
          <Lock size={48} color="#ef4444" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque', marginBottom: '16px' }}>Endpoint Not Found</h1>
          <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
            The admin management API endpoint (<code>/admin/admins</code>) returned a 404 error. 
            This usually means the backend service hasn't implemented this route or it's restricted at the infrastructure level.
          </p>
          <button 
            onClick={() => void load()}
            style={{ padding: '12px 24px', borderRadius: '12px', background: '#0A1E28', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: '#0A1E28', padding: '10px', borderRadius: '12px', color: '#C8F032' }}>
              <ShieldAlert size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', fontFamily: 'Bricolage Grotesque', color: '#0A1E28' }}>Admin Management</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px', fontWeight: '500' }}>Manage administrative access and invite new team members.</p>
        </div>

        <button 
          onClick={() => void load(currentPage)} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh List
        </button>
      </div>
      
      {/* Invite Section */}
      <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px', color: '#0A1E28' }}>
            <UserPlus size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>Invite New Administrator</h3>
        </div>
        
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="email" 
              placeholder="Enter team member email address..." 
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', fontWeight: '500' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={inviting}
            style={{ padding: '0 32px', background: '#0A1E28', color: '#C8F032', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {inviting ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {inviting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Admins Table */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Administrator</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Role Status</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Loading administrators...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>No administrative accounts found.</td></tr>
            ) : admins.map((a) => {
              const id = String(a.id || a._id || '');
              const role = String(a.role || 'admin').toLowerCase();
              const email = String(a.email || a.userEmail || '-');
              const name = String(a.name || '');
              const avatar = a.profile_picture_url || a.avatarUrl;
              const isSuper = role === 'super_admin';

              return (
                <tr key={id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={name || email} 
                          style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1E28', fontWeight: '800' }}>
                          {(name || email)[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#0A1E28' }}>{name || email}</div>
                        {name && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{email}</div>}
                        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>ID: #{id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: isSuper ? '#eff6ff' : '#f8fafc', color: isSuper ? '#3b82f6' : '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                      <ShieldCheck size={14} />
                      {role.replace('_', ' ')}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {!isSuper && (
                        <button 
                          disabled={actionLoadingId === id} 
                          onClick={() => void handleUpgrade(id)}
                          style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #10b981', background: '#ecfdf5', color: '#065f46', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <ArrowUpCircle size={16} />
                          Upgrade
                        </button>
                      )}
                      <button 
                        disabled={actionLoadingId === id} 
                        onClick={() => void handleRemove(id)}
                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Trash2 size={16} />
                        Remove
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
          onPageChange={(p) => void load(p)} 
          isLoading={loading} 
        />
      </div>
    </main>
  );
};

export default AdminAdminsPage;
