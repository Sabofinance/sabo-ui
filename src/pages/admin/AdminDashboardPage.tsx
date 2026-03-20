import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { adminApi, kycApi, depositsApi } from '../../lib/api';
import { adminKycApi } from '../../lib/api/admin.api';
import { useNotifications } from '../../context/NotificationContext';

type AnyRecord = Record<string, unknown>;

const toDateMs = (v: unknown): number | null => {
  const t = new Date(String(v || '')).getTime();
  return Number.isFinite(t) ? t : null;
};

const AdminDashboardPage: React.FC = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [users, setUsers] = useState<AnyRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<AnyRecord | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const [kycSubmissions, setKycSubmissions] = useState<AnyRecord[]>([]);

  const [pendingDeposits, setPendingDeposits] = useState<AnyRecord[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<AnyRecord[]>([]);

  const [depositsActionLoadingId, setDepositsActionLoadingId] = useState<string>('');
  const [kycActionLoadingId, setKycActionLoadingId] = useState<string>('');
  const [userActionLoadingId, setUserActionLoadingId] = useState<string>('');

  const userStatusValue = (u: AnyRecord) =>
    String(u.status || u.state || u.accountStatus || (u.isSuspended ? 'suspended' : '') || '').toLowerCase();

  const isSuspended = (u: AnyRecord) => {
    const s = userStatusValue(u);
    return s.includes('suspend');
  };

  const listAll = async () => {
    setLoading(true);
    setError('');
    setSelectedUser(null);
    try {
      // Admin overview + transactions (ensures ALL admin APIs are consumed).
      const [dashRes, txRes] = await Promise.all([adminApi.getDashboard(), adminApi.listTransactions({ limit: 30 })]);
      if (!dashRes.success) toast.error(dashRes.error?.message || 'Failed to load admin overview');

      if (txRes.success && Array.isArray(txRes.data)) setAdminTransactions(txRes.data);
      else toast.error(txRes.error?.message || 'Failed to load admin transactions');

      const usersRes = await adminApi.listUsers();
      if (usersRes.success && Array.isArray(usersRes.data)) setUsers(usersRes.data);
      else toast.error(usersRes.error?.message || 'Failed to load users');

      const kycRes = await kycApi.listSubmissions();
      if (kycRes.success && Array.isArray(kycRes.data)) setKycSubmissions(kycRes.data);
      else toast.error(kycRes.error?.message || 'Failed to load KYC submissions');

      const depRes = await depositsApi.list({ status: 'pending' });
      if (depRes.success && Array.isArray(depRes.data)) setPendingDeposits(depRes.data);
      else toast.error(depRes.error?.message || 'Failed to load pending deposits');
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin dashboard');
      toast.error(err?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void listAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalUsers = users.length;
  const suspendedUsers = useMemo(() => users.filter((u) => isSuspended(u)).length, [users]);
  const activeUsers = Math.max(0, totalUsers - suspendedUsers);

  const kycCounts = useMemo(() => {
    const counts = { pending: 0, verified: 0, rejected: 0 };
    for (const s of kycSubmissions) {
      const st = String(s.status || s.state || '').toLowerCase();
      if (st.includes('pending') || st === 'submitted' || st === 'unverified') counts.pending += 1;
      else if (st.includes('verify') || st.includes('approved') || st.includes('verified')) counts.verified += 1;
      else if (st.includes('reject') || st.includes('rejected') || st.includes('denied')) counts.rejected += 1;
    }
    return counts;
  }, [kycSubmissions]);

  const kycTrendPoints = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * dayMs);
      const start = new Date(d.toDateString()).getTime();
      const end = start + dayMs;
      const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
      return { start, end, label, count: 0 };
    });

    for (const k of kycSubmissions) {
      const t = toDateMs((k as AnyRecord).createdAt ?? (k as AnyRecord).created_at ?? (k as AnyRecord).date ?? (k as AnyRecord).timestamp);
      if (t == null) continue;
      const b = buckets.find((x) => t >= x.start && t < x.end);
      if (!b) continue;
      b.count += 1;
    }

    return buckets.map((b) => ({ day: b.label, value: b.count }));
  }, [kycSubmissions]);


  const userPieSegments = useMemo(
    () => [
      { label: 'Active', value: activeUsers, color: '#C8F032' },
      { label: 'Suspended', value: suspendedUsers, color: '#EF4444' },
    ],
    [activeUsers, suspendedUsers],
  );

  const kycPieSegments = useMemo(
    () => [
      { label: 'Pending', value: kycCounts.pending, color: '#F59E0B' },
      { label: 'Verified', value: kycCounts.verified, color: '#10B981' },
      { label: 'Rejected', value: kycCounts.rejected, color: '#EF4444' },
    ],
    [kycCounts],
  );

  const buildConicGradient = (segments: { color: string; value: number }[]) => {
    const total = segments.reduce((s, p) => s + p.value, 0);
    if (total <= 0) return `conic-gradient(#e2e8f0 0 360deg)`;
    let acc = 0;
    const stops = segments.map((s) => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${stops.join(',')})`;
  };

  const fetchUserDetails = async (userId: string) => {
    setUserDetailsLoading(true);
    try {
      const res = await adminApi.getUserById(userId);
      if (res.success && res.data) setSelectedUser(res.data as AnyRecord);
      else toast.error(res.error?.message || 'Failed to load user details');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleToggleSuspend = async (user: AnyRecord) => {
    const userId = String(user.id || user.userId || '');
    if (!userId) return;

    const currentlySuspended = isSuspended(user);
    const nextStatus = currentlySuspended ? 'active' : 'suspended';

    setUserActionLoadingId(userId);
    try {
      const res = await adminApi.updateUserStatus(userId, { status: nextStatus });
      if (!res.success) {
        toast.error(res.error?.message || 'Failed to update user status');
        return;
      }
      toast.success(`User ${currentlySuspended ? 'reinstated' : 'suspended'} successfully`);
      await listAll();
    } finally {
      setUserActionLoadingId('');
    }
  };

  const { fetchNotifications } = useNotifications();
  const handleApproveKyc = async (kycId: string) => {
    setKycActionLoadingId(kycId);
    try {
      const res = await adminKycApi.approve(kycId);
      if (!res.success) {
        toast.error('Failed to approve KYC');
        return;
      }
      toast.success('KYC approved');
      fetchNotifications();
      await listAll();
    } finally {
      setKycActionLoadingId('');
    }
  };

  const handleRejectKyc = async (kycId: string) => {
    setKycActionLoadingId(kycId);
    try {
      const reason = prompt('Enter rejection reason:') || 'Incomplete or invalid documents';
      const res = await adminKycApi.reject(kycId, reason);
      if (!res.success) {
        toast.error('Failed to reject KYC');
        return;
      }
      toast.success('KYC rejected');
      fetchNotifications();
      await listAll();
    } finally {
      setKycActionLoadingId('');
    }
  };

  const handleApproveDeposit = async (depositId: string) => {
    setDepositsActionLoadingId(depositId);
    try {
      const res = await depositsApi.approve(depositId);
      if (!res.success) {
        toast.error(res.error?.message || 'Failed to approve deposit');
        return;
      }
      toast.success('Deposit approved');
      await listAll();
    } finally {
      setDepositsActionLoadingId('');
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    setDepositsActionLoadingId(depositId);
    try {
      const res = await depositsApi.reject(depositId);
      if (!res.success) {
        toast.error(res.error?.message || 'Failed to reject deposit');
        return;
      }
      toast.success('Deposit rejected');
      await listAll();
    } finally {
      setDepositsActionLoadingId('');
    }
  };

  const depositsLineSvg = useMemo(() => {
    // Best-effort: bucket deposits by day, based on the list we already loaded.
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * dayMs);
      const start = new Date(d.toDateString()).getTime();
      const end = start + dayMs;
      const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
      return { start, end, label, count: 0 };
    });

    for (const d of pendingDeposits) {
      const t = toDateMs((d as AnyRecord).createdAt ?? (d as AnyRecord).created_at ?? (d as AnyRecord).date ?? (d as AnyRecord).timestamp);
      if (t == null) continue;
      const b = buckets.find((x) => t >= x.start && t < x.end);
      if (!b) continue;
      b.count += 1;
    }

    const max = Math.max(...buckets.map((b) => b.count), 0);
    const width = 220;
    const height = 80;
    const padX = 10;
    const padY = 10;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    const toX = (i: number) => padX + (safeCount(buckets.length) === 1 ? 0 : (i / (buckets.length - 1)) * chartW);
    const toY = (v: number) => padY + (1 - (max > 0 ? v / max : 0)) * chartH;
    const pts = buckets.map((b, i) => `${toX(i)},${toY(b.count)}`).join(' ');

    const circles = buckets
      .map((b, i) => {
        const x = toX(i);
        const y = toY(b.count);
        return <circle key={`${b.label}-${i}`} cx={x} cy={y} r={3.5} fill="#C8F032" />;
      });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="90" aria-label="Deposits trend line chart">
        <polyline points={pts} fill="none" stroke="#C8F032" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {circles}
      </svg>
    );
  }, [pendingDeposits]);

  function safeCount(n: number) {
    return Math.max(0, n);
  }

  if (loading) {
    // Keep layout visible even while data loads.
    return (
      <main className="history-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin</h1>
            <p className="page-subtitle">Moderation & risk controls</p>
          </div>
        </div>
        <div style={{ marginTop: 20, color: '#64748B', textAlign: 'center' }}>Loading admin dashboard...</div>
      </main>
    );
  }

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Users, KYC, and deposit approvals</p>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: '#ffebee', color: '#c62828' }}>
          {error}
        </div>
      )}

      <section className="summary-cards" style={{ marginBottom: 18 }}>
        <div className="summary-card">
          <div className="summary-info">
            <span className="summary-label">Total users</span>
            <span className="summary-value">{totalUsers}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-info">
            <span className="summary-label">Active</span>
            <span className="summary-value">{activeUsers}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-info">
            <span className="summary-label">Suspended</span>
            <span className="summary-value">{suspendedUsers}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-info">
            <span className="summary-label">KYC submissions</span>
            <span className="summary-value">{kycSubmissions.length}</span>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, fontWeight: 700 }}>
              Recent tx: {adminTransactions.length}
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="left-column" style={{ paddingRight: 14 }}>
          <div className="utility-card" style={{ marginBottom: 14 }}>
            <h3>Users status</h3>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 10 }}>
              <div
                aria-label="Users pie chart"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: buildConicGradient([
                    { color: '#C8F032', value: activeUsers },
                    { color: '#EF4444', value: suspendedUsers },
                  ]),
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#0A1E28',
                  }}
                >
                  <div style={{ fontSize: 14 }}>{totalUsers}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>total</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userPieSegments.map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0A1E28', fontWeight: 700 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 4, background: s.color }} />
                      {s.label}
                    </span>
                    <span style={{ color: '#0A1E28', fontWeight: 900 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="utility-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Users</h3>
              <button className="export-btn" onClick={() => void listAll()} style={{ padding: '10px 14px' }}>
                Refresh
              </button>
            </div>

            <div className="history-table-container" style={{ marginTop: 12 }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const id = String(u.id || u.userId || '');
                      const suspended = isSuspended(u);
                      const status = suspended ? 'Suspended' : 'Active';
                      return (
                        <tr key={id}>
                          <td>{id}</td>
                          <td>{String(u.name || [u.firstName, u.lastName].filter(Boolean).join('') || '-')}</td>
                          <td>{String(u.email || '-')}</td>
                          <td>{String(u.role || '-')}</td>
                          <td>{status}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button
                                className="page-number"
                                disabled={userDetailsLoading || userActionLoadingId === id}
                                onClick={() => {
                                  void fetchUserDetails(id);
                                }}
                              >
                                View
                              </button>
                              <button
                                className="page-number"
                                disabled={userActionLoadingId === id}
                                onClick={() => void handleToggleSuspend(u)}
                              >
                                {suspended ? 'Reinstate' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="right-column" style={{ paddingLeft: 14 }}>
          <div className="utility-card" style={{ marginBottom: 14 }}>
            <h3>KYC stats</h3>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 10 }}>
              <div
                aria-label="KYC pie chart"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: buildConicGradient([
                    { color: '#F59E0B', value: kycCounts.pending },
                    { color: '#10B981', value: kycCounts.verified },
                    { color: '#EF4444', value: kycCounts.rejected },
                  ]),
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#0A1E28',
                  }}
                >
                  <div style={{ fontSize: 14 }}>{kycSubmissions.length}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>total</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kycPieSegments.map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0A1E28', fontWeight: 700 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 4, background: s.color }} />
                      {s.label}
                    </span>
                    <span style={{ color: '#0A1E28', fontWeight: 900 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="utility-card" style={{ marginBottom: 14 }}>
            <h3>KYC submissions trend</h3>
            <div style={{ marginTop: 10 }}>
              <svg viewBox="0 0 220 90" width="100%" height="90" aria-label="KYC trend line chart">
                {(() => {
                  const width = 220;
                  const height = 90;
                  const padX = 10;
                  const padY = 10;
                  const chartW = width - padX * 2;
                  const chartH = height - padY * 2;
                  const max = Math.max(...kycTrendPoints.map((p) => p.value), 0);
                  const toX = (i: number) => padX + (kycTrendPoints.length <= 1 ? 0 : (i / (kycTrendPoints.length - 1)) * chartW);
                  const toY = (v: number) => padY + (1 - (max > 0 ? v / max : 0)) * chartH;
                  const pts = kycTrendPoints.map((p, i) => `${toX(i)},${toY(p.value)}`).join(' ');
                  return (
                    <>
                      <polyline
                        points={pts}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {kycTrendPoints.map((p, i) => (
                        <g key={`${p.day}-${i}`}>
                          <circle cx={toX(i)} cy={toY(p.value)} r={3.5} fill="#10B981" />
                        </g>
                      ))}
                      {kycTrendPoints.map((p, i) => (
                        <text
                          key={`lbl-${p.day}-${i}`}
                          x={toX(i)}
                          y={height - 6}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#64748B"
                        >
                          {p.day}
                        </text>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          <div className="utility-card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Pending deposits</h3>
              <div style={{ color: '#64748B', fontSize: 12 }}>{pendingDeposits.length}</div>
            </div>
            <div style={{ marginTop: 10 }}>{depositsLineSvg}</div>
            <div className="history-table-container" style={{ marginTop: 12 }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>
                        No pending deposits.
                      </td>
                    </tr>
                  ) : (
                    pendingDeposits.slice(0, 8).map((d, i) => {
                      const depositId = String(d.id || d.depositId || d._id || i + 1);
                      return (
                        <tr key={depositId}>
                          <td>{depositId}</td>
                          <td>{String(d.amount || d.value || 0)}</td>
                          <td>{String(d.currency || '-')}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button
                                className="page-number"
                                disabled={depositsActionLoadingId === depositId}
                                onClick={() => void handleApproveDeposit(depositId)}
                              >
                                Approve
                              </button>
                              <button
                                className="page-number"
                                disabled={depositsActionLoadingId === depositId}
                                onClick={() => void handleRejectDeposit(depositId)}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="utility-card">
            <h3>KYC submissions</h3>
            <div className="history-table-container" style={{ marginTop: 12 }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Document</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>
                        No KYC submissions.
                      </td>
                    </tr>
                  ) : (
                    kycSubmissions.slice(0, 10).map((k, i) => {
                      const kycId = String((k as AnyRecord).id || (k as AnyRecord).kycId || i + 1);
                      const status = String((k as AnyRecord).status || (k as AnyRecord).state || '-');
                      const doc =
                        String((k as AnyRecord).documentNumber || (k as AnyRecord).document_number || (k as AnyRecord).document || '-');
                      const stLower = String(status || '').toLowerCase();
                      const canVerify = stLower.includes('pending') || stLower.includes('submitted') || stLower === 'unverified' || !stLower;
                      return (
                        <tr key={kycId}>
                          <td>{kycId}</td>
                          <td>{status}</td>
                          <td>{doc}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button
                                className="page-number"
                                disabled={!canVerify || kycActionLoadingId === kycId}
                                onClick={() => void handleApproveKyc(kycId)}
                              >
                                Approve
                              </button>
                              <button
                                className="page-number"
                                disabled={!canVerify || kycActionLoadingId === kycId}
                                onClick={() => void handleRejectKyc(kycId)}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User details panel (lazy-loaded on View) */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="sell-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <button className="modal-close-icon" onClick={() => setSelectedUser(null)} aria-label="Close modal">
              ×
            </button>
            <h2 className="modal-title">User details</h2>
            <p className="modal-subtitle">Admin view</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Name</div>
                <div style={{ fontWeight: 800 }}>{String(selectedUser.name || [selectedUser.firstName, selectedUser.lastName].filter(Boolean).join('') || '-')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Email</div>
                <div style={{ fontWeight: 800 }}>{String(selectedUser.email || '-')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Role</div>
                <div style={{ fontWeight: 800 }}>{String(selectedUser.role || '-')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
                <div style={{ fontWeight: 800 }}>{isSuspended(selectedUser) ? 'Suspended' : 'Active'}</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Raw fields</div>
              <pre
                style={{
                  background: 'rgba(15,23,42,0.04)',
                  borderRadius: 12,
                  padding: 12,
                  overflow: 'auto',
                  color: '#0A1E28',
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
                {JSON.stringify(selectedUser, null, 2)}
              </pre>
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-submit-sabo" onClick={() => setSelectedUser(null)} style={{ width: 'auto', padding: '10px 16px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboardPage;

