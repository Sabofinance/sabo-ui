import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';

type LogRecord = Record<string, unknown>;

const AdminLogsPage: React.FC = () => {
 
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    const res = await adminApi.listLogs();
    if (res.success && Array.isArray(res.data)) setLogs(res.data as LogRecord[]);
    else toast.error(res.error?.message || 'Could not load logs');
    setLoading(false);
  };

  useEffect(() => { void loadLogs(); }, []);

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}><h1>Admin · Logs</h1><p style={{ color: '#5b6774' }}>System log stream for audit and security oversight.</p></div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}><tr><th style={{ padding: 10 }}>ID</th><th style={{ padding: 10 }}>Type</th><th style={{ padding: 10 }}>Message</th><th style={{ padding: 10 }}>Time</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ padding: 12 }}>Loading logs...</td></tr> : logs.length === 0 ? <tr><td colSpan={4} style={{ padding: 12 }}>No logs available.</td></tr> : logs.map((l) => {
              const id = String(l.id || l._id || '');
              return (
                <tr key={id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: 10 }}>{id || 'n/a'}</td>
                  <td style={{ padding: 10 }}>{String(l.type || 'event')}</td>
                  <td style={{ padding: 10 }}>{String(l.message || l.action || '-')}</td>
                  <td style={{ padding: 10 }}>{String(l.timestamp || l.createdAt || '-')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AdminLogsPage;
