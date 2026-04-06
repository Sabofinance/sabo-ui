import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import Pagination from '../../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
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
  ChevronRight
} from 'lucide-react';

type KycRecord = Record<string, any>;

const AdminKycPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState<KycRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const loadSubmissions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listKyc({ page, limit: 10 });
      if (res.success) {
        // Handle the specific data structure: res.data.submissions
        const data = res.data as any;
        const list = data.submissions || extractArray(res.data);
        setSubmissions(Array.isArray(list) ? (list as KycRecord[]) : []);
        const meta = data.meta || res.meta || {};
        setTotalPages(meta.totalPages || meta.last_page || 1);
        setCurrentPage(page);
      } else {
        toast.error(res.error?.message || 'Could not load KYC submissions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadSubmissions(currentPage); }, []);

  const onAction = async (id: string, approve: boolean) => {
    let reason = rejectionReasonInput;
    if (!approve && !reason) {
      reason = prompt('Please enter rejection reason:') || 'Documents do not meet requirements';
      if (reason === null) return;
    }

    setActionLoading(id);
    try {
      const res = approve 
        ? await adminApi.approveKyc(id) 
        : await adminApi.rejectKyc(id, reason);

      if (res.success) {
        toast.success(approve ? 'KYC approved successfully' : 'KYC rejected successfully');
        setSelectedKyc(null);
        setRejectionReasonInput('');
        void loadSubmissions(currentPage);
      } else {
        toast.error(res.error?.message || 'Action failed');
      }
    } finally {
      setActionLoading('');
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('verified') || s.includes('approve')) return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
    if (s.includes('reject') || s.includes('denied')) return { bg: '#fef2f2', text: '#ef4444', icon: <XCircle size={14} /> };
    return { bg: '#fffbeb', text: '#f59e0b', icon: <Clock size={14} /> };
  };

  const filteredSubmissions = submissions.filter(s => {
    const email = String(s.email || s.userEmail || s.user?.email || '');
    const name = String(s.name || s.fullName || s.user?.fullName || '');
    const id = String(s.id || s._id || s.kycId || '');
    const searchStr = `${email} ${name} ${id}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getRejectionReason = (kyc: any) => kyc?.rejection_reason || kyc?.rejectionReason || '';


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
              <ShieldCheck size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', fontFamily: 'Bricolage Grotesque', color: '#0A1E28' }}>KYC Verification</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px', fontWeight: '500' }}>Manage and verify user identity submissions for platform compliance.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', width: '300px', fontSize: '14px', fontWeight: '500' }}
            />
          </div>
          <button 
            onClick={() => void loadSubmissions(currentPage)} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>User Information</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Document Type</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Submitted</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Loading submissions...</td></tr>
            ) : filteredSubmissions.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>No submissions found matching your search.</td></tr>
            ) : filteredSubmissions.map((k) => {
              const id = String(k.id || k._id || k.kycId || '');
              const status = String(k.status || k.state || 'pending');
              const userEmail = String(k.email || k.userEmail || k.user?.email || '-');
              const fullName = String(k.name || k.fullName || k.user?.fullName || 'N/A');
              const docType = String(k.document_type || k.documentType || 'Identity Document');
              const date = k.created_at || k.createdAt || k.submittedAt || Date.now();
              const statusStyle = getStatusColor(status);

              return (
                <tr key={id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1E28', fontWeight: '800' }}>
                        {fullName[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#0A1E28' }}>{fullName}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0A1E28' }}>{docType}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {String(k.documentNumber || '-')}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: statusStyle.bg, color: statusStyle.text, textTransform: 'uppercase' }}>
                      {statusStyle.icon}
                      {status}
                    </span>
                    {getRejectionReason(k) && (
                      <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getRejectionReason(k)}>
                        Reason: {getRejectionReason(k)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                    {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedKyc(k)}
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
          onPageChange={(p) => void loadSubmissions(p)} 
          isLoading={loading} 
        />
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedKyc && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedKyc(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(10, 30, 40, 0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '1000px', maxHeight: '90vh', background: '#fff', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              {/* Modal Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>KYC Document Review</h2>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Submission ID: #{selectedKyc.id || selectedKyc._id || selectedKyc.kycId}</div>
                </div>
                <button onClick={() => setSelectedKyc(null)} style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#fff', color: '#64748b', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
                {/* User & Document Details */}
                <div>
                  <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} /> User Profile
                    </h3>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'Full Name', value: selectedKyc.name || selectedKyc.fullName || selectedKyc.user?.fullName || 'N/A' },
                        { label: 'Username', value: selectedKyc.username || 'N/A' },
                        { label: 'Email Address', value: selectedKyc.email || selectedKyc.userEmail || selectedKyc.user?.email || '-' },
                        { label: 'Phone Number', value: selectedKyc.phone || 'N/A' },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>{item.label}</div>
                          <div style={{ fontSize: '15px', color: '#0A1E28', fontWeight: '700' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {(getRejectionReason(selectedKyc) || /reject|denied/i.test(selectedKyc.status || selectedKyc.state || '')) && (
                    <section style={{ marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <XCircle size={14} /> Rejection Reason
                      </h3>
                      <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '20px', border: '1.5px solid #fee2e2', color: '#b91c1c', fontSize: '14px', fontWeight: '600', lineHeight: '1.6', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)' }}>
                        {getRejectionReason(selectedKyc) || 'No specific reason provided for this rejection.'}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} /> Document Information
                    </h3>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'Document Type', value: selectedKyc.document_type || selectedKyc.documentType || 'Identity Document' },
                        { label: 'Document Number', value: selectedKyc.documentNumber || '-' },
                        { label: 'Submitted On', value: new Date(selectedKyc.created_at || selectedKyc.createdAt || Date.now()).toLocaleString() },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>{item.label}</div>
                          <div style={{ fontSize: '15px', color: '#0A1E28', fontWeight: '700' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Document Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye size={14} /> Document Image
                    </h3>
                    <div style={{ height: '240px', background: '#0A1E28', borderRadius: '24px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #f1f5f9' }}>
                      {selectedKyc.document_url || selectedKyc.documentUrl || selectedKyc.fileUrl ? (
                        <>
                          <img 
                            src={selectedKyc.document_url || selectedKyc.documentUrl || selectedKyc.fileUrl} 
                            alt="KYC Document" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                          <a 
                            href={selectedKyc.document_url || selectedKyc.documentUrl || selectedKyc.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ position: 'absolute', bottom: '20px', right: '20px', background: '#fff', color: '#0A1E28', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          >
                            <ExternalLink size={14} /> Open Full Size
                          </a>
                        </>
                      ) : (
                        <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>
                          <FileText size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>No document image available</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} /> Selfie Verification
                    </h3>
                    <div style={{ height: '240px', background: '#0A1E28', borderRadius: '24px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #f1f5f9' }}>
                      {selectedKyc.selfie_url || selectedKyc.selfieUrl ? (
                        <>
                          <img 
                            src={selectedKyc.selfie_url || selectedKyc.selfieUrl} 
                            alt="KYC Selfie" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                          <a 
                            href={selectedKyc.selfie_url || selectedKyc.selfieUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ position: 'absolute', bottom: '20px', right: '20px', background: '#fff', color: '#0A1E28', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          >
                            <ExternalLink size={14} /> Open Full Size
                          </a>
                        </>
                      ) : (
                        <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>
                          <User size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>No selfie image available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button 
                  onClick={() => setSelectedKyc(null)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                {/pend|subm|unverified/i.test(selectedKyc.status || selectedKyc.state || '') && (
                  <>
                    <button 
                      disabled={actionLoading === selectedKyc.id}
                      onClick={() => void onAction(String(selectedKyc.id), false)}
                      style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <XCircle size={18} />
                      Reject Submission
                    </button>
                    <button 
                      disabled={actionLoading === selectedKyc.id}
                      onClick={() => void onAction(String(selectedKyc.id), true)}
                      style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#0A1E28', color: '#C8F032', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <CheckCircle size={18} />
                      Approve & Verify
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminKycPage;
