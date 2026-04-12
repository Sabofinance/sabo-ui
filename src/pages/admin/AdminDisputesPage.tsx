import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import Pagination from '../../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Search, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
} from 'lucide-react';

const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const loadDisputes = async () => {
    setLoading(true);
    const res = await adminApi.listDisputes({ page: currentPage, limit });
    if (res.success) {
      const data = res.data as any;
      const list = data.disputes || data.items || (Array.isArray(data) ? data : data.data || []);
      setDisputes(list);
      
      const meta = data.meta || data || {};
      setTotal(meta.total || meta.totalCount || meta.total_count || 0);
    } else {
      toast.error('Failed to load disputes');
    }
    setLoading(false);
  };

  useEffect(() => { void loadDisputes(); }, [currentPage]);

  const onResolve = async (id: string) => {
    if (!resolutionNote) {
      toast.error('Please provide a resolution note');
      return;
    }

    setActionLoading(id);
    try {
      const res = await adminApi.resolveDispute(id, resolutionNote);
      if (res.success) {
        toast.success('Dispute resolved successfully');
        setSelectedDispute(null);
        setResolutionNote('');
        void loadDisputes();
      } else {
        toast.error(res.error?.message || 'Failed to resolve dispute');
      }
    } finally {
      setActionLoading('');
    }
  };

  const getStatusColor = (status: string) => {
    const s = String(status || 'open').toLowerCase();
    if (s === 'resolved' || s === 'closed') return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
    if (s === 'rejected' || s === 'cancelled') return { bg: '#fef2f2', text: '#ef4444', icon: <XCircle size={14} /> };
    return { bg: '#fffbeb', text: '#f59e0b', icon: <Clock size={14} /> };
  };

  const filteredDisputes = disputes.filter(d => {
    const userEmail = String(d.userEmail || d.email || d.user?.email || '').toLowerCase();
    const userName = String(d.userName || d.user?.name || d.user?.fullName || '').toLowerCase();
    const tradeId = String(d.trade_id || d.tradeId || '').toLowerCase();
    const reason = String(d.reason || '').toLowerCase();
    const searchStr = `${userEmail} ${userName} ${tradeId} ${reason}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: '#0A1E28', padding: '10px', borderRadius: '12px', color: '#C8F032' }}>
              <AlertCircle size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', fontFamily: 'Bricolage Grotesque', color: '#0A1E28' }}>Trade Disputes</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px', fontWeight: '500' }}>Monitor and manage trade-related conflicts and resolutions.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by user, trade ID or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', width: '300px', fontSize: '14px', fontWeight: '500' }}
            />
          </div>
          <button 
            onClick={() => void loadDisputes()}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Disputes Table */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>User</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Trade Info</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Reason</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Loading disputes...</td></tr>
            ) : filteredDisputes.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>No disputes found.</td></tr>
            ) : filteredDisputes.map((d) => {
              const id = String(d.id || d._id || '');
              const status = String(d.status || 'open');
              const userEmail = String(d.userEmail || d.email || d.user?.email || '-');
              const userName = String(d.userName || d.user?.name || d.user?.fullName || 'N/A');
              const tradeId = String(d.trade_id || d.tradeId || '-');
              const reason = String(d.reason || '-');
              const statusStyle = getStatusColor(status);

              return (
                <tr key={id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1E28', fontWeight: '800' }}>
                        {userName[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#0A1E28' }}>{userName}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0A1E28' }}>Trade #{tradeId}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Dispute ID: {id}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: statusStyle.bg, color: statusStyle.text, textTransform: 'uppercase' }}>
                      {statusStyle.icon}
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b', fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reason}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedDispute(d)}
                      style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Eye size={16} />
                      Review
                    </button>
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
          total={total} 
          limit={limit}
          onPageChange={(p) => setCurrentPage(p)} 
          isLoading={loading} 
        />
      </div>

      {/* Review & Resolution Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDispute(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(10, 30, 40, 0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '600px', maxHeight: '90vh', background: '#fff', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>Dispute Resolution</h2>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Dispute ID: #{selectedDispute.id || selectedDispute._id}</div>
                </div>
                <button onClick={() => setSelectedDispute(null)} style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#fff', color: '#64748b', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <XCircle size={24} />
                </button>
              </div>

              <div style={{ padding: '32px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>Dispute Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>User</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0A1E28' }}>{selectedDispute.userName || selectedDispute.user?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Trade ID</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0A1E28' }}>#{selectedDispute.trade_id || selectedDispute.tradeId}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Reason</div>
                      <div style={{ fontSize: '14px', color: '#0A1E28', lineHeight: '1.5' }}>{selectedDispute.reason || 'No reason provided'}</div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0A1E28', marginBottom: '8px' }}>Resolution Note</label>
                    <textarea 
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Explain how this dispute was resolved..."
                      style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: '#f8fafc' }}>
                <button 
                  onClick={() => setSelectedDispute(null)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => void onResolve(selectedDispute.id || selectedDispute._id)}
                  disabled={actionLoading === (selectedDispute.id || selectedDispute._id)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#0A1E28', color: '#C8F032', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: actionLoading ? 0.7 : 1 }}
                >
                  {actionLoading ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Resolve Dispute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminDisputesPage;