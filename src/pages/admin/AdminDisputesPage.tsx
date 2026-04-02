import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import Pagination from '../../components/Pagination';

const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadDisputes = async (page = 1) => {
    setLoading(true);
    const res = await adminApi.listDisputes({ page, limit: 15 });
    if (res.success) {
      const data = res.data as any;
      const list = Array.isArray(data) ? data : data.data || [];
      setDisputes(list);
      const meta = data.meta || data;
      setTotalPages(meta.totalPages || meta.last_page || 1);
      setCurrentPage(page);
    } else {
      toast.error('Failed to load disputes');
    }
    setLoading(false);
  };

  useEffect(() => { void loadDisputes(currentPage); }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Disputes</h1>
          <p style={{ color: '#6b7a99', marginTop: 4 }}>Monitor and manage user trade disputes.</p>
        </div>
        <button 
          onClick={() => void loadDisputes()} 
          disabled={loading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 20px', 
            borderRadius: '99px', 
            border: '1.5px solid #e3e8f0', 
            background: '#fff', 
            color: '#0d1829', 
            fontSize: '13px', 
            fontWeight: '600', 
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(13,24,41,.06)',
            transition: 'all .15s'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e8f0', borderRadius: 20, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f4f6f9' }}>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Trade ID</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#98a5be', textTransform: 'uppercase' }}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#6b7a99' }}>Loading disputes...</td></tr>
            ) : disputes.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#6b7a99' }}>No disputes found.</td></tr>
            ) : (
              disputes.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #e3e8f0' }}>
                  <td style={{ padding: 16, fontFamily: 'monospace' }}>#{d.id}</td>
                  <td style={{ padding: 16 }}>{d.userEmail || d.email}</td>
                  <td style={{ padding: 16, fontFamily: 'monospace' }}>#{d.trade_id || d.tradeId}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: 99, 
                      fontSize: 11, 
                      fontWeight: 700, 
                      background: d.status === 'open' ? '#fee2e2' : '#dcfce7',
                      color: d.status === 'open' ? '#dc2626' : '#16a34a'
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: 16, color: '#6b7a99', fontSize: 13 }}>{d.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(p) => void loadDisputes(p)} 
        isLoading={loading} 
      />
    </div>
  );
};

export default AdminDisputesPage;