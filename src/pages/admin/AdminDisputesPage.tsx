import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';

const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDisputes = async () => {
    setLoading(true);
    const res = await adminApi.listDisputes();
    if (res.success && Array.isArray(res.data)) setDisputes(res.data);
    else toast.error('Failed to load disputes');
    setLoading(false);
  };

  useEffect(() => { void loadDisputes(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Disputes</h1>
        <p style={{ color: '#6b7a99' }}>Monitor and manage user trade disputes.</p>
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
    </div>
  );
};

export default AdminDisputesPage;