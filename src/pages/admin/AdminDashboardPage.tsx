import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import { useNotifications } from '../../context/NotificationContext';

type AnyRecord = Record<string, unknown>;

/* ─── helpers ─────────────────────────────────────────────── */
const toDateMs = (v: unknown): number | null => {
  const t = new Date(String(v || '')).getTime();
  return Number.isFinite(t) ? t : null;
};
const fmt = (n: number) => new Intl.NumberFormat('en-NG').format(n);

/* ─── global styles ───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

.adm {
  --bg: #f8fafc;
  --surface: #ffffff;
  --border: #e2e8f0;
  --text: #0f172a;
  --muted: #64748b;
  --accent: #C8F135;
  --blue: #3b82f6;
  --green: #10b981;
  --red: #ef4444;
  --amber: #f59e0b;
  
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding: 24px;
}

.adm-container {
  max-width: 1400px;
  margin: 0 auto;
}

.adm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.adm-header h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

.adm-header p {
  color: var(--muted);
  margin: 4px 0 0;
  font-size: 14px;
}

/* Stats Grid */
.adm-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.adm-stat-card {
  background: var(--surface);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.adm-stat-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adm-stat-value {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 32px;
  font-weight: 800;
  margin: 8px 0;
}

.adm-stat-footer {
  font-size: 12px;
  color: var(--muted);
}

/* Main Content Grid */
.adm-main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1100px) {
  .adm-main-grid {
    grid-template-columns: 1fr;
  }
}

.adm-card {
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  margin-bottom: 24px;
}

.adm-card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.adm-card-header h3 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.adm-card-content {
  padding: 0;
}

/* Table Styles */
.adm-table {
  width: 100%;
  border-collapse: collapse;
}

.adm-table th {
  text-align: left;
  padding: 12px 24px;
  background: #f1f5f9;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adm-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.adm-table tr:last-child td {
  border-bottom: none;
}

/* Status Tags */
.adm-tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.adm-tag-success { background: #dcfce7; color: #16a34a; }
.adm-tag-warning { background: #fef3c7; color: #d97706; }
.adm-tag-error { background: #fee2e2; color: #ef4444; }
.adm-tag-info { background: #dbeafe; color: #2563eb; }

/* Buttons */
.adm-btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.adm-btn-refresh:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.adm-btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: white;
  transition: all 0.2s;
}

.adm-btn-action:hover {
  background: #f1f5f9;
}

/* Donut & Charts */
.adm-chart-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.adm-donut-box {
  display: flex;
  align-items: center;
  gap: 20px;
}

.adm-donut-visual {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: relative;
}

.adm-donut-inner {
  position: absolute;
  inset: 15px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.adm-donut-inner b { font-size: 18px; color: var(--text); }
.adm-donut-inner span { font-size: 10px; color: var(--muted); }

.adm-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.adm-legend-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.adm-legend-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
}

.adm-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.adm-legend-value {
  font-weight: 700;
  color: var(--text);
}

/* Modal Overlay */
.adm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.adm-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.adm-modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.adm-modal-body {
  padding: 24px;
}

.adm-modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
`;

/* ─── Donut chart ─────────────────────────────────────────── */
const Donut: React.FC<{ segments: { label: string; value: number; color: string }[]; total: number; label: string }> = ({ segments, total, label }) => {
  const grad = useMemo(() => {
    const t = segments.reduce((s, p) => s + p.value, 0);
    if (t <= 0) return 'conic-gradient(#e3e8f0 0 360deg)';
    let acc = 0;
    const stops = segments.map(s => {
      const start = (acc / t) * 360;
      acc += s.value;
      const end = (acc / t) * 360;
      return `${s.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
    });
    return `conic-gradient(${stops.join(',')})`;
  }, [segments]);

  return (
    <div className="adm-donut-box">
      <div className="adm-donut-visual" style={{ background: grad }}>
        <div className="adm-donut-inner">
          <b>{total}</b>
          <span>{label}</span>
        </div>
      </div>
      <div className="adm-legend">
        {segments.map(s => (
          <div key={s.label} className="adm-legend-item">
            <div className="adm-legend-label">
              <span className="adm-legend-dot" style={{ background: s.color }} />
              {s.label}
            </div>
            <span className="adm-legend-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Inline SVG sparkline ────────────────────────────────── */
const SparkLine: React.FC<{ points: { day: string; value: number }[]; color: string; height?: number }> = ({ points, color, height = 72 }) => {
  const W = 300, H = height, padX = 12, padY = 10;
  const cW = W - padX * 2, cH = H - padY * 2;
  const max = Math.max(...points.map(p => p.value), 1);
  const toX = (i: number) => padX + (points.length <= 1 ? cW / 2 : (i / (points.length - 1)) * cW);
  const toY = (v: number) => padY + (1 - v / max) * cH;
  const polyPts = points.map((p, i) => `${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`).join(' ');
  const areaClose = `${toX(points.length - 1).toFixed(1)},${(padY + cH).toFixed(1)} ${toX(0).toFixed(1)},${(padY + cH).toFixed(1)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${polyPts} ${areaClose}`} fill={`url(#g-${color.replace('#', '')})`} />
      <polyline points={polyPts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.value)} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
      {points.map((p, i) => (
        <text key={`l${i}`} x={toX(i)} y={H - 2} textAnchor="middle" fontSize="9.5" fill="#98a5be" fontFamily="DM Sans, system-ui">{p.day}</text>
      ))}
    </svg>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const AdminDashboardPage: React.FC = () => {
  const { fetchNotifications } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<AnyRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<AnyRecord | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<AnyRecord | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [kycSubmissions, setKycSubmissions] = useState<AnyRecord[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<AnyRecord[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<AnyRecord[]>([]);
  const [disputes, setDisputes] = useState<AnyRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<AnyRecord | null>(null);
  const [analyticsImpact, setAnalyticsImpact] = useState<AnyRecord | null>(null);
  const [depositsActionLoadingId, setDepositsActionLoadingId] = useState('');
  const [kycActionLoadingId, setKycActionLoadingId] = useState('');
  const [userActionLoadingId, setUserActionLoadingId] = useState('');

  const userStatusValue = (u: AnyRecord) =>
    String(u.status || u.state || u.accountStatus || (u.isSuspended ? 'suspended' : '') || '').toLowerCase();
  const isSuspended = (u: AnyRecord) => userStatusValue(u).includes('suspend');

  const safeList = (value: unknown): AnyRecord[] => {
    if (Array.isArray(value)) return value as AnyRecord[];
    if (!value || typeof value !== 'object') return [];
    const obj = value as Record<string, unknown>;
    const candidates = ['users', 'submissions', 'deposits', 'transactions', 'disputes', 'recentKyc', 'items', 'results', 'rows', 'records', 'list', 'data'];
    for (const key of candidates) {
      if (Array.isArray(obj[key])) return obj[key] as AnyRecord[];
    }
    return [];
  };

  const listAll = async () => {
    setLoading(true); setError(''); setSelectedUser(null); setSelectedDeposit(null);
    try {
      const [dashRes, txRes, impactRes] = await Promise.allSettled([
        adminApi.getDashboard(), 
        adminApi.listTransactions({ limit: 30 }),
        adminApi.getAnalyticsImpact()
      ]);
      console.log('AdminDashboard responses:', { dashRes, txRes, impactRes });
      
      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashboardData(dashRes.value.data as AnyRecord ?? null);
      } else if (dashRes.status === 'fulfilled' && !dashRes.value.success) {
        toast.error(dashRes.value.error?.message || 'Failed to load dashboard overview');
      }

      if (txRes.status === 'fulfilled' && txRes.value.success) {
        setAdminTransactions(safeList(txRes.value.data));
      }

      if (impactRes.status === 'fulfilled' && impactRes.value.success) {
        setAnalyticsImpact(impactRes.value.data as AnyRecord ?? null);
      }

      const [usersRes, kycRes, depRes, disputesRes] = await Promise.allSettled([
        adminApi.listUsers(),
        adminApi.listKyc(),
        adminApi.listDeposits({ status: 'pending' }),
        adminApi.listDisputes({ status: 'open', limit: 10 })
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        setUsers(safeList(usersRes.value.data));
      }
      if (kycRes.status === 'fulfilled' && kycRes.value.success) {
        setKycSubmissions(safeList(kycRes.value.data));
      }
      if (depRes.status === 'fulfilled' && depRes.value.success) {
        setPendingDeposits(safeList(depRes.value.data));
      }
      if (disputesRes.status === 'fulfilled' && disputesRes.value.success) {
        setDisputes(safeList(disputesRes.value.data));
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to load admin dashboard';
      setError(msg); toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void listAll(); }, []);

  /* Derived counts */
  const usersSummary = dashboardData?.users && typeof dashboardData.users === 'object' ? (dashboardData.users as AnyRecord) : null;
  const kycSummary = dashboardData?.kyc && typeof dashboardData.kyc === 'object' ? (dashboardData.kyc as AnyRecord) : null;

  const totalUsers = Number(usersSummary?.total ?? usersSummary?.usersCount ?? users.length);
  const suspendedUsers = useMemo(() => {
    if (typeof usersSummary?.suspended === 'number') return usersSummary.suspended;
    if (typeof usersSummary?.suspended === 'string') return Number(usersSummary.suspended) || 0;
    return users.filter(u => isSuspended(u)).length;
  }, [users, usersSummary]);
  const activeUsers = Number(usersSummary?.active ?? usersSummary?.activeUsers ?? Math.max(0, totalUsers - suspendedUsers));

  const kycCounts = useMemo(() => {
    if (kycSummary) {
      return {
        pending: Number(kycSummary.pending ?? kycSummary.unverified ?? 0),
        verified: Number(kycSummary.verified ?? kycSummary.approved ?? 0),
        rejected: Number(kycSummary.rejected ?? 0),
      };
    }
    const c = { pending: 0, verified: 0, rejected: 0 };
    for (const s of kycSubmissions) {
      const st = String(s.status || s.state || '').toLowerCase();
      if (st.includes('pending') || st === 'submitted' || st === 'unverified') c.pending++;
      else if (st.includes('verify') || st.includes('approved') || st.includes('verified')) c.verified++;
      else if (st.includes('reject') || st.includes('denied')) c.rejected++;
    }
    return c;
  }, [kycSubmissions]);

  /* Trend data */
  const make7Buckets = () => {
    const now = new Date(), dayMs = 86400000;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * dayMs);
      const start = new Date(d.toDateString()).getTime();
      return { start, end: start + dayMs, label: d.toLocaleDateString('en-GB', { weekday: 'short' }), value: 0 };
    });
  };

  const kycTrendPoints = useMemo(() => {
    const chartsData = dashboardData?.charts as AnyRecord | undefined;
    const dashboardTrend = Array.isArray(chartsData?.kycSubmissions)
      ? chartsData.kycSubmissions as AnyRecord[]
      : Array.isArray(dashboardData?.kycTrend)
        ? dashboardData.kycTrend as AnyRecord[]
        : [];
    if (dashboardTrend.length > 0) {
      return dashboardTrend.map((p) => ({
        day: String(p.day || p.label || '?'),
        value: Number(p.value || p.count || 0),
      }));
    }

    const b = make7Buckets();
    for (const k of kycSubmissions) {
      const t = toDateMs((k as AnyRecord).createdAt ?? (k as AnyRecord).created_at ?? (k as AnyRecord).date ?? (k as AnyRecord).timestamp);
      if (t == null) continue;
      const bk = b.find(x => t >= x.start && t < x.end);
      if (bk) bk.value++;
    }
    return b.map(x => ({ day: x.label, value: x.value }));
  }, [kycSubmissions, dashboardData]);

  const depositTrendPoints = useMemo(() => {
    const chartsData = dashboardData?.charts as AnyRecord | undefined;
    const dashboardTrend = Array.isArray(chartsData?.deposits)
      ? chartsData.deposits as AnyRecord[]
      : Array.isArray(dashboardData?.depositTrend)
        ? dashboardData.depositTrend as AnyRecord[]
        : [];
    if (dashboardTrend.length > 0) {
      return dashboardTrend.map((p) => ({
        day: String(p.day || p.label || '?'),
        value: Number(p.value || p.count || 0),
      }));
    }

    const b = make7Buckets();
    for (const d of pendingDeposits) {
      const t = toDateMs((d as AnyRecord).createdAt ?? (d as AnyRecord).created_at ?? (d as AnyRecord).date ?? (d as AnyRecord).timestamp);
      if (t == null) continue;
      const bk = b.find(x => t >= x.start && t < x.end);
      if (bk) bk.value++;
    }
    return b.map(x => ({ day: x.label, value: x.value }));
  }, [pendingDeposits, dashboardData]);

  /* Actions */
  const fetchUserDetails = async (userId: string) => {
    setUserDetailsLoading(true);
    try {
      const res = await adminApi.getUserById(userId);
      if (res.success && res.data) setSelectedUser(res.data as AnyRecord);
      else toast.error(res.error?.message || 'Failed to load user details');
    } finally { setUserDetailsLoading(false); }
  };

  const handleToggleSuspend = async (user: AnyRecord) => {
    const userId = String(user.id || user.userId || '');
    if (!userId) return;
    setUserActionLoadingId(userId);
    try {
      const res = isSuspended(user)
        ? await adminApi.reinstateUser(userId)
        : await adminApi.suspendUser(userId);
      if (!res.success) { toast.error(res.error?.message || 'Failed to update user status'); return; }
      toast.success(isSuspended(user) ? 'User reinstated successfully' : 'User suspended successfully');
      await listAll();
    } finally { setUserActionLoadingId(''); }
  };

  const handleApproveKyc = async (kycId: string) => {
    setKycActionLoadingId(kycId);
    try {
      const res = await adminApi.approveKyc(kycId);
      if (!res.success) { toast.error('Failed to approve KYC'); return; }
      toast.success('KYC approved'); fetchNotifications(); await listAll();
    } finally { setKycActionLoadingId(''); }
  };

  const handleRejectKyc = async (kycId: string) => {
    setKycActionLoadingId(kycId);
    try {
      const reason = prompt('Enter rejection reason:') || 'Incomplete or invalid documents';
      const res = await adminApi.rejectKyc(kycId, reason);
      if (!res.success) { toast.error('Failed to reject KYC'); return; }
      toast.success('KYC rejected'); fetchNotifications(); await listAll();
    } finally { setKycActionLoadingId(''); }
  };

  const handleApproveDeposit = async (depositId: string) => {
    setDepositsActionLoadingId(depositId);
    try {
      const res = await adminApi.approveDeposit(depositId);
      if (!res.success) { toast.error(res.error?.message || 'Failed to approve deposit'); return; }
      toast.success('Deposit approved'); await listAll();
    } finally { setDepositsActionLoadingId(''); }
  };

  const handleRejectDeposit = async (depositId: string) => {
    setDepositsActionLoadingId(depositId);
    try {
      const res = await adminApi.rejectDeposit(depositId);
      if (!res.success) { toast.error(res.error?.message || 'Failed to reject deposit'); return; }
      toast.success('Deposit rejected'); await listAll();
    } finally { setDepositsActionLoadingId(''); }
  };

  const handleVerifyFlutterwave = async (depositId: string) => {
    setDepositsActionLoadingId(depositId);
    try {
      const res = await adminApi.verifyFlutterwave(depositId);
      if (!res.success) {
        toast.error(res.error?.message || 'Verification failed');
        return;
      }
      toast.success('Transaction verified and credited!');
      await listAll();
    } finally {
      setDepositsActionLoadingId('');
    }
  };

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const kycStatusTag = (status: string) => {
    const st = status.toLowerCase();
    if (st.includes('verified') || st.includes('approved')) return <span className="adm-tag adm-tag-green">{status}</span>;
    if (st.includes('reject') || st.includes('denied')) return <span className="adm-tag adm-tag-red">{status}</span>;
    return <span className="adm-tag adm-tag-amber">{status || 'Pending'}</span>;
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="adm">
        <style>{CSS}</style>
        <div className="adm-page">
          <div className="adm-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Users, KYC, and deposit approvals</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7a99', fontSize: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚙️</div>
            Loading admin dashboard...
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="adm">
      <style>{CSS}</style>
      <div className="adm-container">
        
        {/* Header */}
        <header className="adm-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>System overview, user management, and transaction approvals.</p>
          </div>
          <button className="adm-btn-refresh" onClick={() => void listAll()} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {error && <div className="adm-error">{error}</div>}

        {/* Stats Row */}
        <div className="adm-stats-grid">
          {[
            { label: 'Total Users', value: totalUsers, sub: 'Registered accounts', color: '#3b82f6' },
            { label: 'Active Users', value: activeUsers, sub: 'In good standing', color: '#10b981' },
            { label: 'Suspended', value: suspendedUsers, sub: 'Access restricted', color: '#ef4444' },
            { label: 'KYC Pending', value: kycCounts.pending, sub: 'Needs review', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="adm-stat-card">
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="adm-stat-footer">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Status Breakdown Section */}
        <section className="adm-card" style={{ marginBottom: '32px' }}>
          <div className="adm-card-header">
            <h3>Status Breakdown</h3>
          </div>
          <div className="adm-chart-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <Donut
              total={totalUsers}
              label="Users"
              segments={[
                { label: 'Active', value: activeUsers, color: 'var(--green)' },
                { label: 'Suspended', value: suspendedUsers, color: 'var(--red)' },
              ]}
            />
            <Donut
              total={kycSubmissions.length}
              label="KYC"
              segments={[
                { label: 'Verified', value: kycCounts.verified, color: 'var(--green)' },
                { label: 'Pending', value: kycCounts.pending, color: 'var(--amber)' },
                { label: 'Rejected', value: kycCounts.rejected, color: 'var(--red)' },
              ]}
            />
          </div>
        </section>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pending Deposits */}
          <section className="adm-card">
            <div className="adm-card-header">
              <h3>Pending Deposits</h3>
              <span className="adm-tag adm-tag-warning">{pendingDeposits.length} Pending</span>
            </div>
            <div className="adm-card-content">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Provider</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDeposits.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No pending deposits</td></tr>
                  ) : (
                    pendingDeposits.map((d, i) => (
                      <tr key={String(d.id || i)}>
                        <td style={{ fontWeight: 600 }}>#{String(d.id || '-').slice(0, 8)}</td>
                        <td style={{ fontWeight: 700 }}>{fmt(Number(d.amount || 0))}</td>
                        <td><span className="adm-tag adm-tag-info">{String(d.currency || 'NGN')}</span></td>
                        <td style={{ color: 'var(--muted)' }}>{String(d.provider || 'Flutterwave')}</td>
                        <td>
                          <button className="adm-btn-action" onClick={() => setSelectedDeposit(d)}>View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* KYC Submissions */}
          <section className="adm-card">
            <div className="adm-card-header">
              <h3>KYC Submissions</h3>
              <span className="adm-tag adm-tag-info">{kycSubmissions.length} Total</span>
            </div>
            <div className="adm-card-content">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {kycSubmissions.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No KYC submissions</td></tr>
                  ) : (
                    kycSubmissions.slice(0, 10).map((k, i) => {
                      const status = String(k.status || 'pending').toLowerCase();
                      return (
                        <tr key={String(k.id || i)}>
                          <td style={{ fontWeight: 600 }}>{String(k.userEmail || k.user || '-')}</td>
                          <td>
                            <span className={`adm-tag ${status.includes('approved') ? 'adm-tag-success' : status.includes('rejected') ? 'adm-tag-error' : 'adm-tag-warning'}`}>
                              {status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--muted)' }}>
                            {k.createdAt ? new Date(String(k.createdAt)).toLocaleDateString() : '-'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button 
                                className="adm-btn-action" 
                                style={{ color: 'var(--green)' }}
                                onClick={() => void handleApproveKyc(String(k.id))}
                              >
                                Approve
                              </button>
                              <button 
                                className="adm-btn-action" 
                                style={{ color: 'var(--red)' }}
                                onClick={() => void handleRejectKyc(String(k.id))}
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
          </section>

          {/* Open Disputes Section */}
          <section className="adm-card">
            <div className="adm-card-header">
              <h3>Open Disputes</h3>
              <span className="adm-tag adm-tag-error">{disputes.length} Open</span>
            </div>
            <div className="adm-card-content">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Reason</th>
                    <th>Created At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No open disputes</td></tr>
                  ) : (
                    disputes.slice(0, 10).map((d, i) => (
                      <tr key={String(d.id || i)}>
                        <td style={{ fontWeight: 600 }}>#{String(d.id || '-').slice(0, 8)}</td>
                        <td>{String(d.userEmail || d.user || '-')}</td>
                        <td style={{ color: 'var(--muted)' }}>{String(d.reason || d.subject || 'No reason')}</td>
                        <td>{d.createdAt ? new Date(String(d.createdAt)).toLocaleDateString() : '-'}</td>
                        <td><span className="adm-tag adm-tag-warning">Open</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Deposit detail modal */}
      {selectedDeposit && (
        <div className="adm-overlay" onClick={() => setSelectedDeposit(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 style={{ margin: 0, fontFamily: 'Bricolage Grotesque', fontSize: '20px' }}>Deposit Details</h2>
              <button style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setSelectedDeposit(null)}>×</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {[
                  { label: 'ID', value: String(selectedDeposit.id || selectedDeposit.depositId || '-') },
                  { label: 'User', value: String(selectedDeposit.userEmail || selectedDeposit.email || selectedDeposit.user || '-') },
                  { label: 'Amount', value: `${fmt(Number(selectedDeposit.amount || 0))} ${String(selectedDeposit.currency || '-')}` },
                  { label: 'Provider', value: String(selectedDeposit.provider || selectedDeposit.gateway || '-') },
                  { label: 'Status', value: String(selectedDeposit.status || 'Pending') },
                  { label: 'Date', value: String(selectedDeposit.createdAt || selectedDeposit.date ? new Date(String(selectedDeposit.createdAt || selectedDeposit.date)).toLocaleString() : '-') },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              
              {/* Proof of Payment */}
              {(() => {
                const proofUrl = String(selectedDeposit.proof || selectedDeposit.proof_url || selectedDeposit.documentUrl || "");
                if (!proofUrl) return null;
                return (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Proof of Payment</label>
                      <a href={proofUrl} download target="_blank" rel="noreferrer" className="adm-btn-action" style={{ textDecoration: 'none' }}>Download</a>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={proofUrl} alt="Proof" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#f8fafc' }} />
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="adm-modal-footer">
              <button 
                className="adm-btn-action" 
                style={{ padding: '10px 20px', color: 'var(--red)', borderColor: 'var(--red)', fontWeight: 700 }}
                onClick={() => { void handleRejectDeposit(String(selectedDeposit.id)); setSelectedDeposit(null); }}
              >
                Reject
              </button>
              <button 
                className="adm-btn-action" 
                style={{ padding: '10px 20px', background: 'var(--text)', color: 'white', fontWeight: 700 }}
                onClick={() => { void handleApproveDeposit(String(selectedDeposit.id)); setSelectedDeposit(null); }}
              >
                Approve (Manual)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="adm-overlay" onClick={() => setSelectedUser(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 style={{ margin: 0, fontFamily: 'Bricolage Grotesque', fontSize: '20px' }}>User Details</h2>
              <button style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {[
                  { label: 'Name', value: String(selectedUser.name || [selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(' ') || '—') },
                  { label: 'Email', value: String(selectedUser.email || '—') },
                  { label: 'Role', value: String(selectedUser.role || '—') },
                  { label: 'Status', value: isSuspended(selectedUser) ? 'Suspended' : 'Active' },
                  { label: 'Phone', value: String(selectedUser.phone || selectedUser.phoneNumber || '—') },
                  { label: 'KYC Status', value: String(selectedUser.kyc_status || selectedUser.kycStatus || '—') },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Raw JSON</div>
                <pre className="adm-modal-pre">{JSON.stringify(selectedUser, null, 2)}</pre>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button
                className="adm-btn-action"
                style={{ padding: '10px 20px', background: 'var(--text)', color: 'white', fontWeight: 700 }}
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage; 