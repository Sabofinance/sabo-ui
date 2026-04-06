import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import Pagination from '../../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownCircle, 
  Search, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  CreditCard,
  DollarSign,
  Download,
  ShieldCheck
} from 'lucide-react';

type DepositRecord = Record<string, any>;

const AdminDepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending review' | 'completed' | 'failed'>('pending review');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      // Map frontend filters to API expected values: approved, rejected, pending
      const apiStatus = statusFilter === 'all' ? undefined : 
                        statusFilter === 'completed' ? 'completed' : 
                        statusFilter === 'failed' ? 'rejected' :
                        undefined; // Let backend return all or handle 'initiated'/'pending'

      const res = await adminApi.listDeposits({ 
        status: apiStatus, 
        page, 
        limit: 20 
      });
      if (res.success) {
        // Handle the specific data structure: res.data.deposits
        const data = res.data as any;
        const list = data.deposits || extractArray(res.data);
        setDeposits(Array.isArray(list) ? (list as DepositRecord[]) : []);
        
        const meta = data.meta || res.meta || {};
        setTotalPages(meta.totalPages || meta.last_page || 1);
        setCurrentPage(page);
      } else {
        toast.error(res.error?.message || 'Could not load deposits');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    void load(1); 
  }, [statusFilter]);

  const onAction = async (id: string, approve: boolean) => {
    if (approve && !window.confirm('Are you sure you want to approve this deposit?')) return;
    
    const reason = rejectionReasonInput;
    if (!approve && !reason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(id);
    try {
      const res = approve ? await adminApi.approveDeposit(id) : await adminApi.rejectDeposit(id, reason);
      if (res.success) {
        toast.success(approve ? 'Deposit approved successfully' : 'Deposit rejected successfully');
        setSelectedDeposit(null);
        setShowRejectConfirm(false);
        setRejectionReasonInput('');
        void load(currentPage);
      } else {
        toast.error(res.error?.message || 'Action failed');
      }
    } finally {
      setActionLoading('');
    }
  };

  const onVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminApi.verifyFlutterwave(id);
      if (res.success) {
        toast.success('Transaction verified and credited!');
        setSelectedDeposit(null);
        void load(currentPage);
      } else {
        toast.error(res.error?.message || 'Verification failed');
      }
    } finally {
      setActionLoading('');
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete') || s.includes('success') || s.includes('approve')) 
      return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
    if (s.includes('fail') || s.includes('reject') || s.includes('denied')) 
      return { bg: '#fef2f2', text: '#ef4444', icon: <XCircle size={14} /> };
    return { bg: '#fffbeb', text: '#f59e0b', icon: <Clock size={14} /> };
  };

  const filteredDeposits = deposits.filter(d => {
    const searchStr = `${d.userEmail} ${d.email} ${d.id} ${d.amount}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    
    // Robust status matching for frontend filtering
    const currentStatus = String(d.status || d.state || '').toLowerCase();
    let matchesStatus = true;
    
    if (statusFilter === 'pending review') {
      // Be inclusive of initiated or pending
      matchesStatus = currentStatus.includes('initiated') || currentStatus.includes('pend') || currentStatus === '';
    } else if (statusFilter === 'completed') {
      matchesStatus = currentStatus.includes('approve') || currentStatus.includes('complete') || currentStatus.includes('success');
    } else if (statusFilter === 'failed') {
      matchesStatus = currentStatus.includes('reject') || currentStatus.includes('fail') || currentStatus.includes('denied');
    }

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => String(d.status).toLowerCase().includes('pending')).length,
    totalAmount: deposits.reduce((acc, d) => acc + Number(d.amount || 0), 0)
  };

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
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
              <ArrowDownCircle size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', fontFamily: 'Bricolage Grotesque', color: '#0A1E28' }}>Deposit Management</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px', fontWeight: '500' }}>Review and process user deposit transactions across all gateways.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, email or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', width: '300px', fontSize: '14px', fontWeight: '500' }}
            />
          </div>
          <button 
            onClick={() => void load(currentPage)} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Pending Review', value: stats.pending, color: '#f59e0b', icon: Clock },
          { label: 'Page Volume', value: `₦${stats.totalAmount.toLocaleString()}`, color: '#10b981', icon: DollarSign },
          { label: 'Total on Page', value: stats.total, color: '#0A1E28', icon: CreditCard },
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
        {(['all', 'pending review', 'completed', 'failed'] as const).map(f => (
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

      {/* Deposits Table */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Transaction ID</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>User</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Amount</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Gateway</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Loading deposits...</td></tr>
            ) : filteredDeposits.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>No deposits found matching your search.</td></tr>
            ) : filteredDeposits.map((d) => {
              const id = String(d.id || d._id || '');
              const status = String(d.status || 'pending');
              const userEmail = String(d.user_email || d.userEmail || d.email || d.user?.email || '-');
              const userName = String(d.user_name || d.name || d.user?.fullName || 'User');
              const currency = String(d.currency || 'NGN').toUpperCase();
              const gateway = String(d.provider || d.gateway || 'Manual');
              const date = d.created_at || d.createdAt || d.submittedAt || Date.now();
              const statusStyle = getStatusStyle(status);

              return (
                <tr key={id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6', cursor: 'pointer' }} onClick={() => setSelectedDeposit(d)}>#{d.reference || id.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(date).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1E28', fontWeight: '800', fontSize: '12px' }}>
                        {userName[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0A1E28' }}>{userName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0A1E28' }}>{Number(d.amount || 0).toLocaleString()} {currency}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize', border: '1px solid #e2e8f0' }}>
                      <CreditCard size={14} />
                      {gateway}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: statusStyle.bg, color: statusStyle.text, textTransform: 'uppercase' }}>
                      {statusStyle.icon}
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedDeposit(d)}
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
          totalPages={totalPages} 
          onPageChange={(p) => void load(p)} 
          isLoading={loading} 
        />
      </div>

      {/* Deposit Detail Modal */}
      <AnimatePresence>
        {selectedDeposit && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDeposit(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(10, 30, 40, 0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '900px', maxHeight: '90vh', background: '#fff', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              {/* Modal Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>Deposit Transaction Review</h2>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Reference: #{String(selectedDeposit.id || selectedDeposit._id)}</div>
                </div>
                <button onClick={() => setSelectedDeposit(null)} style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#fff', color: '#64748b', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
                {/* Transaction Details */}
                <div>
                  <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} /> Transaction Info
                    </h3>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        { label: 'Amount', value: `${Number(selectedDeposit.amount || 0).toLocaleString()} ${String(selectedDeposit.currency || 'NGN').toUpperCase()}`, highlight: true },
                        { label: 'User Name', value: String(selectedDeposit.user_name || selectedDeposit.name || selectedDeposit.user?.fullName || 'User') },
                        { label: 'User Email', value: String(selectedDeposit.user_email || selectedDeposit.email || selectedDeposit.user?.email || '-') },
                        { label: 'Gateway Provider', value: String(selectedDeposit.provider || selectedDeposit.gateway || 'Manual') },
                        { label: 'Current Status', value: String(selectedDeposit.status || 'Pending'), status: true },
                        { label: 'Created On', value: new Date(selectedDeposit.created_at || selectedDeposit.date || Date.now()).toLocaleString() },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>{item.label}</div>
                          <div style={{ 
                            fontSize: item.highlight ? '24px' : '15px', 
                            color: item.highlight ? '#0A1E28' : '#475569', 
                            fontWeight: '800',
                            fontFamily: item.highlight ? 'Bricolage Grotesque' : 'inherit'
                          }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Gateway Specific Info */}
                  <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={14} /> Gateway Verification
                    </h3>
                    <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '20px', border: '1px solid #dbeafe' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', fontWeight: '500', lineHeight: '1.5' }}>
                        {String(selectedDeposit.provider || '').toLowerCase().includes('flutterwave') 
                          ? 'This transaction originated from Flutterwave. You can use the automated verification tool to confirm status with the bank.'
                          : 'This is a manual bank transfer or proof-of-payment deposit. Please verify the uploaded document carefully before approving.'}
                      </p>
                    </div>
                  </section>

                  {/* Rejection Reason (NEW) */}
                  {(selectedDeposit.rejection_reason || selectedDeposit.rejectionReason || String(selectedDeposit.status).toLowerCase().includes('reject')) && (
                    <section>
                      <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <XCircle size={14} /> Rejection Reason
                      </h3>
                      <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '20px', border: '1.5px solid #fee2e2', color: '#b91c1c', fontSize: '14px', fontWeight: '600', lineHeight: '1.6' }}>
                        {selectedDeposit.rejection_reason || selectedDeposit.rejectionReason || 'No specific reason was provided for this rejection.'}
                      </div>
                    </section>
                  )}
                </div>

                {/* Proof of Payment Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} /> Proof of Payment
                  </h3>
                  <div style={{ flex: 1, minHeight: '400px', background: '#0A1E28', borderRadius: '24px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #f1f5f9' }}>
                    {(() => {
                      const proofUrl = String(selectedDeposit.proof || selectedDeposit.proof_url || selectedDeposit.documentUrl || "");
                      if (proofUrl) {
                        return (
                          <>
                            <img 
                              src={proofUrl} 
                              alt="Proof of payment" 
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                            <a 
                              href={proofUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ position: 'absolute', bottom: '20px', right: '20px', background: '#fff', color: '#0A1E28', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            >
                              <ExternalLink size={14} /> View Full Size
                            </a>
                            <a 
                              href={proofUrl} 
                              download
                              style={{ position: 'absolute', bottom: '20px', left: '20px', background: '#C8F032', color: '#0A1E28', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            >
                              <Download size={14} /> Download
                            </a>
                          </>
                        );
                      }
                      return (
                        <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>
                          <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>No proof of payment available</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setSelectedDeposit(null)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Close
                </button>
                
                {String(selectedDeposit.status).toLowerCase().includes('pending') && (
                  <>
                    <button 
                      disabled={!!actionLoading}
                      onClick={() => setShowRejectConfirm(true)}
                      style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                    <button 
                      disabled={!!actionLoading}
                      onClick={() => void onAction(String(selectedDeposit.id), true)}
                      style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <CheckCircle size={18} />
                      Manual Approve
                    </button>
                    {String(selectedDeposit.provider || '').toLowerCase().includes('flutterwave') && (
                      <button 
                        disabled={!!actionLoading}
                        onClick={() => void onVerify(String(selectedDeposit.id))}
                        style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#0A1E28', color: '#C8F032', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        {actionLoading === String(selectedDeposit.id) ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                        Verify & Credit
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Confirmation Modal */}
      <AnimatePresence>
        {showRejectConfirm && selectedDeposit && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRejectConfirm(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(10, 30, 40, 0.8)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '450px', background: '#fff', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <div style={{ padding: '32px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <XCircle size={32} />
                </div>
                
                <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>Confirm Rejection</h2>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                  You are about to reject the deposit of <strong>{Number(selectedDeposit.amount || 0).toLocaleString()} {String(selectedDeposit.currency || 'NGN').toUpperCase()}</strong>. This action cannot be undone.
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Reason for Rejection</label>
                  <textarea 
                    autoFocus
                    placeholder="Enter the reason why this deposit is being rejected..."
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', fontFamily: 'inherit', resize: 'none', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setShowRejectConfirm(false)}
                    style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!rejectionReasonInput || !!actionLoading}
                    onClick={() => void onAction(String(selectedDeposit.id), false)}
                    style={{ 
                      flex: 1.5, padding: '14px', borderRadius: '14px', border: 'none', 
                      background: '#ef4444', color: '#fff', fontWeight: '800', cursor: 'pointer',
                      opacity: !rejectionReasonInput || !!actionLoading ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {actionLoading === String(selectedDeposit.id) ? <RefreshCw size={18} className="animate-spin" /> : <XCircle size={18} />}
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminDepositsPage;
