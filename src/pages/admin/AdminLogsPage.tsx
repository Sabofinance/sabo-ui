import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import Pagination from '../../components/Pagination';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function actionLabel(action: string): string {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionColor(action: string): { bg: string; color: string } {
  if (action.includes('SUSPEND') || action.includes('REJECT') || action.includes('REMOVE'))
    return { bg: '#fceaea', color: '#c0251e' };
  if (action.includes('APPROVE') || action.includes('REINSTATE') || action.includes('VERIFY'))
    return { bg: '#e6f7ed', color: '#1a7a3c' };
  if (action.includes('INVITE') || action.includes('UPGRADE'))
    return { bg: '#e4edfb', color: '#1847a8' };
  if (action.includes('USERNAME') || action.includes('CHANGED'))
    return { bg: '#fef3dc', color: '#8a4f00' };
  return { bg: '#f1f5f9', color: '#475569' };
}

function renderDetails(details: Record<string, unknown>): React.ReactNode {
  if (!details || Object.keys(details).length === 0) return <span style={{ color: '#b4bfad' }}>—</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Object.entries(details).map(([k, v]) => (
        <span key={k} style={{ fontSize: 11 }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>{k}: </span>
          <span style={{ color: '#334155' }}>{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listLogs({ page, limit: 20 });

      if (res.success) {
        // API returns: { data: { logs: [...] }, meta: {} }
        // res.data is the inner `data` object → { logs: [...] }
        const inner = res.data as { logs?: AdminLog[] } | AdminLog[] | null;

        let list: AdminLog[] = [];

        if (Array.isArray(inner)) {
          // Unlikely but safe — if the API ever returns a bare array
          list = inner;
        } else if (inner && Array.isArray((inner as any).logs)) {
          // Correct path: inner = { logs: [...] }
          list = (inner as { logs: AdminLog[] }).logs;
        }

        setLogs(list);

        // Pagination — try meta first, fall back to single page
        const meta = (res as any).meta ?? {};
        setTotalPages(
          meta.totalPages ?? meta.last_page ?? meta.total_pages ?? 1
        );
        setCurrentPage(page);
      } else {
        toast.error(res.error?.message || 'Could not load logs');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs(1);
  }, [loadLogs]);

  return (
    <main style={{ padding: '24px 28px 60px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
            Admin Logs
          </h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14, margin: '4px 0 0' }}>
            System audit trail — all admin actions are recorded here.
          </p>
        </div>
        <button
          onClick={() => void loadLogs(currentPage)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 9,
            border: '1px solid #e2e8f0', background: '#fff',
            color: '#0f172a', fontSize: 13, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all .15s',
          }}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e5e9df', borderRadius: 14, overflowX: 'auto', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e9df' }}>
              {['Action', 'Target', 'Details', 'Admin ID', 'Time'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.7px',
                    textTransform: 'uppercase', color: '#94a3b8',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows
              [...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          height: 14, borderRadius: 6,
                          background: 'linear-gradient(90deg,#f0f0f0 25%,#f8f8f8 50%,#f0f0f0 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.5s infinite',
                          width: j === 2 ? '80%' : j === 0 ? '60%' : '50%',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }}>
                    <rect x="2" y="3" width="20" height="18" rx="3" />
                    <path d="M7 8h10M7 12h6" />
                  </svg>
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const colors = actionColor(log.action);
                return (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Action */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px',
                          borderRadius: 99, display: 'inline-block',
                          background: colors.bg, color: colors.color,
                          letterSpacing: 0.3,
                        }}
                      >
                        {actionLabel(log.action)}
                      </span>
                    </td>

                    {/* Target */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        {log.target_type}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>
                        {log.target_id.slice(0, 8)}…
                      </div>
                    </td>

                    {/* Details */}
                    <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                      {renderDetails(log.details)}
                    </td>

                    {/* Admin ID */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
                        {log.admin_id.slice(0, 8)}…
                      </span>
                    </td>

                    {/* Time */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => void loadLogs(p)}
        isLoading={loading}
      />

      <style>{`
        @keyframes shimmer {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
};

export default AdminLogsPage;