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

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

.adm{
  --bg:       #f4f6f9;
  --surface:  #ffffff;
  --border:   #e3e8f0;
  --border-2: #cdd5e0;
  --text:     #0d1829;
  --muted:    #6b7a99;
  --subtle:   #98a5be;
  --accent:   #7cb800;
  --accent-bg:#eef9cc;
  --accent-lt:#f5fde4;
  --green:    #16a34a;
  --green-bg: #dcfce7;
  --red:      #dc2626;
  --red-bg:   #fee2e2;
  --amber:    #d97706;
  --amber-bg: #fef3c7;
  --blue:     #2563eb;
  --blue-bg:  #dbeafe;
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
  --sh-sm: 0 1px 3px rgba(13,24,41,.06), 0 1px 2px rgba(13,24,41,.04);
  --sh-md: 0 4px 16px rgba(13,24,41,.08), 0 2px 6px rgba(13,24,41,.04);
  --sh-lg: 0 12px 40px rgba(13,24,41,.10);
  font-family:'DM Sans',system-ui,sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
}
.adm h1,.adm h2,.adm h3,.adm h4{font-family:'Bricolage Grotesque',system-ui,sans-serif;}

/* Page shell */
.adm-page{padding:clamp(16px,3vw,32px);max-width:1440px;margin:0 auto;}

/* Header */
.adm-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:24px;}
.adm-header h1{font-size:clamp(20px,3vw,28px);font-weight:800;letter-spacing:-0.5px;line-height:1.2;}
.adm-header p{font-size:13px;color:var(--muted);margin-top:3px;}
.adm-refresh-btn{
  display:flex;align-items:center;gap:7px;
  padding:9px 18px;border-radius:99px;border:1.5px solid var(--border-2);
  background:var(--surface);color:var(--text);
  font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;
  box-shadow:var(--sh-sm);transition:all .15s;
}
.adm-refresh-btn:hover{background:var(--bg);border-color:var(--accent);}

/* Stat cards row */
.adm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
@media(max-width:900px){.adm-stats{grid-template-columns:repeat(2,1fr);}}
@media(max-width:480px){.adm-stats{grid-template-columns:1fr 1fr;}}

.adm-stat{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-xl);padding:20px 22px;box-shadow:var(--sh-sm);
  display:flex;flex-direction:column;gap:6px;position:relative;overflow:hidden;
}
.adm-stat::before{
  content:'';position:absolute;top:-24px;right:-24px;
  width:80px;height:80px;border-radius:50%;
  background:radial-gradient(circle,var(--dot-color,#e3e8f0) 0%,transparent 70%);
  pointer-events:none;opacity:.6;
}
.adm-stat-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--muted);}
.adm-stat-value{font-size:32px;font-weight:900;letter-spacing:-1px;font-family:'Bricolage Grotesque',system-ui,sans-serif;line-height:1;}
.adm-stat-sub{font-size:12px;color:var(--muted);font-weight:500;}

/* Two-col grid */
.adm-grid{display:grid;grid-template-columns:1fr 380px;gap:20px;align-items:start;}
@media(max-width:1100px){.adm-grid{grid-template-columns:1fr;}}

.adm-col{display:flex;flex-direction:column;gap:16px;}

/* Card */
.adm-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-xl);box-shadow:var(--sh-sm);overflow:hidden;
}
.adm-card-body{padding:22px 24px;}
.adm-card-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 24px;border-bottom:1px solid var(--border);
}
.adm-card-head h3{font-size:15px;font-weight:700;letter-spacing:-.2px;}

/* Donut chart wrapper */
.adm-donut-row{display:flex;align-items:center;gap:24px;padding:20px 24px;}
.adm-donut{
  width:110px;height:110px;min-width:110px;border-radius:50%;
  position:relative;flex-shrink:0;
}
.adm-donut-hole{
  position:absolute;inset:18px;border-radius:50%;
  background:var(--surface);display:flex;flex-direction:column;
  align-items:center;justify-content:center;
}
.adm-donut-hole span{font-size:16px;font-weight:900;color:var(--text);}
.adm-donut-hole small{font-size:10px;font-weight:600;color:var(--muted);margin-top:1px;}
.adm-legend{display:flex;flex-direction:column;gap:10px;}
.adm-legend-item{display:flex;align-items:center;justify-content:space-between;gap:16px;}
.adm-legend-label{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text);}
.adm-legend-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0;}
.adm-legend-val{font-size:14px;font-weight:800;color:var(--text);}

/* Tags */
.adm-tag{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;letter-spacing:.3px;white-space:nowrap;}
.adm-tag-green{background:var(--green-bg);color:var(--green);}
.adm-tag-red{background:var(--red-bg);color:var(--red);}
.adm-tag-amber{background:var(--amber-bg);color:var(--amber);}
.adm-tag-blue{background:var(--blue-bg);color:var(--blue);}
.adm-tag-gray{background:var(--bg);color:var(--muted);}
.adm-tag-accent{background:var(--accent-bg);color:var(--accent);}

/* Tables */
.adm-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.adm-table{width:100%;border-collapse:collapse;font-size:13px;min-width:460px;}
.adm-table th{
  text-align:left;padding:10px 16px;
  font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;
  color:var(--subtle);background:var(--bg);border-bottom:1px solid var(--border);
  white-space:nowrap;
}
.adm-table td{
  padding:12px 16px;border-bottom:1px solid var(--border);
  vertical-align:middle;
}
.adm-table tr:last-child td{border-bottom:none;}
.adm-table tr:hover td{background:#fafbfd;}
.adm-table td.mono{font-family:monospace;font-size:12px;color:var(--muted);}

/* Action buttons */
.adm-btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:6px 14px;border-radius:99px;border:none;
  font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;
  transition:opacity .15s,transform .1s;white-space:nowrap;
}
.adm-btn:active{transform:scale(.97);}
.adm-btn:disabled{opacity:.45;cursor:not-allowed;}
.adm-btn-outline{background:var(--bg);color:var(--text);border:1.5px solid var(--border-2);}
.adm-btn-outline:hover:not(:disabled){border-color:var(--text);}
.adm-btn-green{background:var(--green-bg);color:var(--green);}
.adm-btn-green:hover:not(:disabled){background:#bbf7d0;}
.adm-btn-red{background:var(--red-bg);color:var(--red);}
.adm-btn-red:hover:not(:disabled){background:#fecaca;}
.adm-btn-amber{background:var(--amber-bg);color:var(--amber);}
.adm-btn-blue{background:var(--blue-bg);color:var(--blue);}

/* SVG charts */
.adm-chart-wrap{padding:0 24px 16px;}

/* Error banner */
.adm-error{margin-bottom:16px;padding:14px 18px;border-radius:var(--r-md);background:var(--red-bg);color:var(--red);font-weight:600;font-size:13px;}

/* Empty */
.adm-empty{text-align:center;padding:28px 16px;color:var(--subtle);font-size:13px;}

/* Avatar initials */
.adm-avatar{
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800;flex-shrink:0;
  background:var(--accent-bg);color:var(--accent);
}

/* Modal */
.adm-overlay{
  position:fixed;inset:0;background:rgba(13,24,41,.45);
  backdrop-filter:blur(6px);z-index:1000;
  display:flex;align-items:center;justify-content:center;padding:20px;
}
.adm-modal{
  background:var(--surface);border-radius:var(--r-xl);
  width:100%;max-width:520px;box-shadow:var(--sh-lg);
  overflow:hidden;animation:adm-pop .2s cubic-bezier(.34,1.56,.64,1);
}
@keyframes adm-pop{from{opacity:0;transform:scale(.94) translateY(10px);}to{opacity:1;transform:none;}}
.adm-modal-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid var(--border);
}
.adm-modal-head h2{font-size:18px;font-weight:800;}
.adm-modal-close{
  width:32px;height:32px;border-radius:50%;border:1px solid var(--border);
  background:var(--bg);cursor:pointer;font-size:18px;color:var(--muted);
  display:flex;align-items:center;justify-content:center;line-height:1;
}
.adm-modal-close:hover{background:var(--red-bg);color:var(--red);border-color:var(--red-bg);}
.adm-modal-body{padding:24px;}
.adm-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.adm-modal-field label{font-size:10.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--subtle);display:block;margin-bottom:4px;}
.adm-modal-field p{font-size:14px;font-weight:700;color:var(--text);}
.adm-modal-pre{
  background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);
  padding:14px;font-size:11.5px;font-family:monospace;
  overflow:auto;max-height:240px;line-height:1.5;color:var(--text);margin-top:12px;
}
.adm-modal-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;}

/* Animations */
@keyframes adm-rise{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
.adm-rise{animation:adm-rise .4s cubic-bezier(.22,1,.36,1) both;}
.adm-d1{animation-delay:.04s;}.adm-d2{animation-delay:.09s;}
.adm-d3{animation-delay:.14s;}.adm-d4{animation-delay:.19s;}
.adm-d5{animation-delay:.24s;}.adm-d6{animation-delay:.29s;}
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
    <div className="adm-donut-row">
      <div className="adm-donut" style={{ background: grad }}>
        <div className="adm-donut-hole">
          <span>{total}</span>
          <small>{label}</small>
        </div>
      </div>
      <div className="adm-legend">
        {segments.map(s => (
          <div key={s.label} className="adm-legend-item">
            <span className="adm-legend-label">
              <span className="adm-legend-dot" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="adm-legend-val">{s.value}</span>
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
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [kycSubmissions, setKycSubmissions] = useState<AnyRecord[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<AnyRecord[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<AnyRecord[]>([]);
  const [disputes, setDisputes] = useState<AnyRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<AnyRecord | null>(null);
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
    setLoading(true); setError(''); setSelectedUser(null);
    try {
      const [dashRes, txRes] = await Promise.all([adminApi.getDashboard(), adminApi.listTransactions({ limit: 30 })]);
      console.log('AdminDashboard getDashboard', dashRes);
      console.log('AdminDashboard listTransactions', txRes);
      if (!dashRes.success) {
        toast.error(dashRes.error?.message || 'Failed to load admin overview');
      } else {
        setDashboardData(dashRes.data as AnyRecord ?? null);
      }

      if (txRes.success) {
        setAdminTransactions(safeList(txRes.data));
      } else {
        toast.error(txRes.error?.message || 'Failed to load admin transactions');
      }

      const usersRes = await adminApi.listUsers();
      if (usersRes.success) {
        const usersList = safeList(usersRes.data);
        setUsers(usersList);
      } else {
        toast.error(usersRes.error?.message || 'Failed to load users');
      }

      const kycRes = await adminApi.listKyc();
      if (kycRes.success) {
        setKycSubmissions(safeList(kycRes.data));
      } else {
        toast.error(kycRes.error?.message || 'Failed to load KYC submissions');
      }

      const depRes = await adminApi.listDeposits({ status: 'pending' });
      if (depRes.success) {
        setPendingDeposits(safeList(depRes.data));
      } else {
        toast.error(depRes.error?.message || 'Failed to load pending deposits');
      }

      const disputesRes = await adminApi.listDisputes({ status: 'open', limit: 10 });
      if (disputesRes.success) {
        setDisputes(safeList(disputesRes.data));
      } else {
        toast.error(disputesRes.error?.message || 'Failed to load disputes');
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
      <div className="adm-page">

        {/* Header */}
        <div className="adm-header adm-rise">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Users, KYC, and deposit approvals · {adminTransactions.length} recent transactions</p>
          </div>
          <button className="adm-refresh-btn" onClick={() => void listAll()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        </div>

        {error && <div className="adm-error adm-rise">{error}</div>}

        {/* Stat cards */}
        <div className="adm-stats adm-rise adm-d1">
          {[
            { label: 'Total Users', value: totalUsers, sub: 'All registered accounts', color: '#dbeafe', accent: '#2563eb' },
            { label: 'Active Users', value: activeUsers, sub: 'In good standing', color: '#dcfce7', accent: '#16a34a' },
            { label: 'Suspended', value: suspendedUsers, sub: 'Access restricted', color: '#fee2e2', accent: '#dc2626' },
            { label: 'KYC Submissions', value: kycSubmissions.length, sub: `${kycCounts.pending} pending review`, color: '#fef3c7', accent: '#d97706' },
            { label: 'Open Disputes', value: disputes.length, sub: 'Needs resolution', color: '#fee2e2', accent: '#dc2626' },
          ].map(s => (
            <div key={s.label} className="adm-stat" style={{ '--dot-color': s.color } as React.CSSProperties}>
              <span className="adm-stat-label">{s.label}</span>
              <span className="adm-stat-value" style={{ color: s.accent }}>{s.value}</span>
              <span className="adm-stat-sub">{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="adm-grid">

          {/* ── Left column ── */}
          <div className="adm-col">

            {/* User status donut */}
            <div className="adm-card adm-rise adm-d2">
              <div className="adm-card-head">
                <h3>User Status</h3>
                <span className="adm-tag adm-tag-gray">{totalUsers} total</span>
              </div>
              <Donut
                total={totalUsers}
                label="users"
                segments={[
                  { label: 'Active', value: activeUsers, color: '#7cb800' },
                  { label: 'Suspended', value: suspendedUsers, color: '#dc2626' },
                ]}
              />
            </div>

            {/* Users table */}
            <div className="adm-card adm-rise adm-d3">
              <div className="adm-card-head">
                <h3>Users</h3>
                <span className="adm-tag adm-tag-blue">{users.length} accounts</span>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5} className="adm-empty">No users found.</td></tr>
                    ) : (
                      users.map(u => {
                        const id = String(u.id || u.userId || '');
                        const name = String(u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Unknown');
                        const suspended = isSuspended(u);
                        const isLoading = userActionLoadingId === id;
                        return (
                          <tr key={id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="adm-avatar">{initials(name)}</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                                  <div className="mono" style={{ fontSize: 11 }}>#{id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{String(u.email || '-')}</td>
                            <td>
                              <span className="adm-tag adm-tag-gray" style={{ textTransform: 'capitalize' }}>{String(u.role || 'user')}</span>
                            </td>
                            <td>
                              <span className={`adm-tag ${suspended ? 'adm-tag-red' : 'adm-tag-green'}`}>
                                {suspended ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="adm-btn adm-btn-blue"
                                  disabled={userDetailsLoading || isLoading}
                                  onClick={() => void fetchUserDetails(id)}
                                >
                                  View
                                </button>
                                <button
                                  className={`adm-btn ${suspended ? 'adm-btn-green' : 'adm-btn-red'}`}
                                  disabled={isLoading}
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

          {/* ── Right column ── */}
          <div className="adm-col">

            {/* KYC donut */}
            <div className="adm-card adm-rise adm-d2">
              <div className="adm-card-head">
                <h3>KYC Status</h3>
                <span className="adm-tag adm-tag-amber">{kycCounts.pending} pending</span>
              </div>
              <Donut
                total={kycSubmissions.length}
                label="kyc"
                segments={[
                  { label: 'Pending', value: kycCounts.pending, color: '#d97706' },
                  { label: 'Verified', value: kycCounts.verified, color: '#16a34a' },
                  { label: 'Rejected', value: kycCounts.rejected, color: '#dc2626' },
                ]}
              />
            </div>

            {/* KYC trend */}
            <div className="adm-card adm-rise adm-d3">
              <div className="adm-card-head">
                <h3>KYC Submissions — 7 days</h3>
              </div>
              <div className="adm-chart-wrap" style={{ paddingTop: 12 }}>
                <SparkLine points={kycTrendPoints} color="#16a34a" height={80} />
              </div>
            </div>

            {/* Pending deposits */}
            <div className="adm-card adm-rise adm-d4">
              <div className="adm-card-head">
                <h3>Pending Deposits</h3>
                <span className="adm-tag adm-tag-accent">{pendingDeposits.length}</span>
              </div>
              <div className="adm-chart-wrap" style={{ paddingTop: 12 }}>
                <SparkLine points={depositTrendPoints} color="#7cb800" height={72} />
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
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
                      <tr><td colSpan={4} className="adm-empty">No pending deposits.</td></tr>
                    ) : (
                      pendingDeposits.slice(0, 8).map((d, i) => {
                        const depositId = String(d.id || d.depositId || d._id || i + 1);
                        const isLoading = depositsActionLoadingId === depositId;
                        return (
                          <tr key={depositId}>
                            <td className="mono">#{depositId}</td>
                            <td style={{ fontWeight: 700 }}>{fmt(Number(d.amount || d.value || 0))}</td>
                            <td><span className="adm-tag adm-tag-gray">{String(d.currency || '-')}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="adm-btn adm-btn-green" disabled={isLoading} onClick={() => void handleApproveDeposit(depositId)}>
                                  Approve
                                </button>
                                <button className="adm-btn adm-btn-red" disabled={isLoading} onClick={() => void handleRejectDeposit(depositId)}>
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

            {/* Open Disputes */}
            <div className="adm-card adm-rise adm-d5">
              <div className="adm-card-head">
                <h3>Open Disputes</h3>
                <span className="adm-tag adm-tag-red">{disputes.length} open</span>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.length === 0 ? (
                      <tr><td colSpan={4} className="adm-empty">No open disputes.</td></tr>
                    ) : (
                      disputes.slice(0, 8).map((d, i) => {
                        const id = String(d.id || d._id || d.disputeId || i + 1);
                        return (
                          <tr key={id}>
                            <td className="mono">#{id}</td>
                            <td style={{ color: 'var(--muted)' }}>{String(d.userEmail || d.email || d.user || '—')}</td>
                            <td><span className="adm-tag adm-tag-amber">{String(d.status || d.state || 'open')}</span></td>
                            <td>{String(d.amount || d.value || '—')}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* KYC submissions table */}
            <div className="adm-card adm-rise adm-d5">
              <div className="adm-card-head">
                <h3>KYC Submissions</h3>
                <span className="adm-tag adm-tag-gray">{kycSubmissions.length} total</span>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
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
                      <tr><td colSpan={4} className="adm-empty">No KYC submissions.</td></tr>
                    ) : (
                      kycSubmissions.slice(0, 10).map((k, i) => {
                        const kycId = String(k.id || k.kycId || i + 1);
                        const status = String(k.status || k.state || '');
                        const doc = String(k.documentNumber || k.document_number || k.document || '—');
                        const stLower = status.toLowerCase();
                        const canVerify = !stLower || stLower.includes('pending') || stLower.includes('submitted') || stLower === 'unverified';
                        const isLoading = kycActionLoadingId === kycId;
                        return (
                          <tr key={kycId}>
                            <td className="mono">#{kycId}</td>
                            <td>{kycStatusTag(status)}</td>
                            <td style={{ color: 'var(--muted)', fontSize: 12 }}>{doc}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="adm-btn adm-btn-green" disabled={!canVerify || isLoading} onClick={() => void handleApproveKyc(kycId)}>
                                  Approve
                                </button>
                                <button className="adm-btn adm-btn-red" disabled={!canVerify || isLoading} onClick={() => void handleRejectKyc(kycId)}>
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
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="adm-overlay" onClick={() => setSelectedUser(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>User Details</h2>
              <button className="adm-modal-close" onClick={() => setSelectedUser(null)} aria-label="Close">×</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-modal-grid">
                {[
                  { label: 'Name', value: String(selectedUser.name || [selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(' ') || '—') },
                  { label: 'Email', value: String(selectedUser.email || '—') },
                  { label: 'Role', value: String(selectedUser.role || '—') },
                  { label: 'Status', value: isSuspended(selectedUser) ? 'Suspended' : 'Active' },
                  { label: 'Phone', value: String(selectedUser.phone || selectedUser.phoneNumber || '—') },
                  { label: 'KYC Status', value: String(selectedUser.kyc_status || selectedUser.kycStatus || '—') },
                ].map(f => (
                  <div key={f.label} className="adm-modal-field">
                    <label>{f.label}</label>
                    <p>{f.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--subtle)', marginBottom: 6 }}>Raw JSON</div>
                <pre className="adm-modal-pre">{JSON.stringify(selectedUser, null, 2)}</pre>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button
                className="adm-btn"
                style={{ background: 'var(--text)', color: '#fff', padding: '9px 22px', borderRadius: 99, fontSize: 13 }}
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