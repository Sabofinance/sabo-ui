import React, { useEffect, useState, useMemo } from 'react';
import { adminApi } from '../../lib/api';
import ActivityChart from '../../components/ActivityChart';
import type { ActivityChartPoint } from '../../components/ActivityChart';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Download, 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';

type AnyRecord = Record<string, unknown>;

/* ─── Simple Donut Component for Distributions ─── */
const DonutMini: React.FC<{ 
  segments: { label: string; value: number; color: string }[]; 
  total: number; 
  title: string 
}> = ({ segments, total, title }) => {
  const grad = useMemo(() => {
    if (total <= 0) return 'conic-gradient(#e3e8f0 0 360deg)';
    let acc = 0;
    const stops = segments.map(s => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      return `${s.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
    });
    return `conic-gradient(${stops.join(',')})`;
  }, [segments, total]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        width: '80px', height: '80px', borderRadius: '50%', background: grad, 
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        <div style={{ 
          position: 'absolute', inset: '12px', background: 'white', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800'
        }}>
          {total}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0A1E28' }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {segments.map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }} />
                {s.label}
              </span>
              <span style={{ fontWeight: '700', color: '#0A1E28' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState<AnyRecord | null>(null);
  const [dashboardData, setDashboardData] = useState<AnyRecord | null>(null);
  const [users, setUsers] = useState<AnyRecord[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<AnyRecord[]>([]);
  const [activeDisputes, setActiveDisputes] = useState<AnyRecord[]>([]);
  const [timeframe, setTimeframe] = useState<'day' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      console.log('[Analytics] Fetching with:', { timeframe, ...dateRange });
      
      const [impactRes, dashRes, txRes, usersRes, kycRes, disputesRes] = await Promise.allSettled([
        adminApi.getAnalyticsImpact({ timeframe, ...dateRange }),
        adminApi.getDashboard(),
        adminApi.listTransactions({ page, limit: 10 }),
        adminApi.listUsers(),
        adminApi.listKyc(),
        adminApi.listDisputes({ status: 'open', limit: 10 })
      ]);

      if (impactRes.status === 'fulfilled' && impactRes.value.success) {
        setImpactData(impactRes.value.data as AnyRecord);
      }

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashboardData(dashRes.value.data as AnyRecord);
      }

      if (txRes.status === 'fulfilled' && txRes.value.success) {
        const data = txRes.value.data as any;
        const list = Array.isArray(data) ? data : data.data || [];
        setRecentActivities(list);
        const meta = data.meta || data;
        setTotalPages(meta.totalPages || meta.last_page || 1);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : (usersRes.value.data as any).data || []);
      }

      if (kycRes.status === 'fulfilled' && kycRes.value.success) {
        setKycSubmissions(Array.isArray(kycRes.value.data) ? kycRes.value.data : (kycRes.value.data as any).data || []);
      }

      if (disputesRes.status === 'fulfilled' && disputesRes.value.success) {
        setActiveDisputes(Array.isArray(disputesRes.value.data) ? disputesRes.value.data : (disputesRes.value.data as any).data || []);
      }
    } catch (err) {
      console.error('[Analytics] Fetch Error:', err);
      toast.error('An error occurred while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, [timeframe, page]);

  const chartPoints: ActivityChartPoint[] = useMemo(() => {
    if (!impactData) return [];
    
    // Based on the provided Swagger response: data.scale.allTimeLedgerVolume
    const scale = (impactData.data as any)?.scale || impactData.scale || {};
    const ledger = scale.allTimeLedgerVolume || [];
                   
    return (ledger as Array<{ currency: string; total_processed: string }>).map(d => ({
      day: d.currency,
      trades: 0,
      volume: Number(d.total_processed || 0)
    }));
  }, [impactData]);

  const stats = useMemo(() => {
    if (!impactData) return [];
    try {
      const d = (impactData.data as any) || impactData;
      const traction = d.traction?.userGrowth30Days || d.userGrowth30Days || {};
      const trust = d.trustAndSafety?.tradeSafety || d.tradeSafety || {};
      const efficiency = d.efficiency || {};
      
      const ledger = d.scale?.allTimeLedgerVolume || d.allTimeLedgerVolume || [];
      const totalVol = Array.isArray(ledger) 
        ? ledger.reduce((acc: number, curr: any) => acc + Number(curr.total_processed || 0), 0)
        : 0;

      return [
        { label: 'Total Volume', value: `₦${totalVol.toLocaleString()}`, trend: 0, icon: TrendingUp, color: '#10b981' },
        { label: 'User Growth', value: String(traction.recent_count || '0'), trend: Number(traction.growth_percentage || 0), icon: Users, color: '#f59e0b' },
        { label: 'Total Trades', value: String(trust.total_trades || '0'), trend: 0, icon: Activity, color: '#3b82f6' },
        { label: 'Admin Actions', value: String(efficiency.adminActions30Days || '0'), trend: 0, icon: Zap, color: '#8b5cf6' },
      ];
    } catch (e) {
      console.error('[Analytics] Mapping Error:', e);
      return [];
    }
  }, [impactData]);

  const distributions = useMemo(() => {
    const usersSummary = dashboardData?.users as AnyRecord | undefined;
    const kycSummary = dashboardData?.kyc as AnyRecord | undefined;

    const kyc = [
      { label: 'Verified', value: Number(kycSummary?.verified ?? 0), color: '#10b981' },
      { label: 'Pending', value: Number(kycSummary?.pending ?? 0), color: '#f59e0b' },
      { label: 'Rejected', value: Number(kycSummary?.rejected ?? 0), color: '#ef4444' },
    ];

    const usersCount = Number(usersSummary?.total ?? users.length);
    const suspendedCount = Number(usersSummary?.suspended ?? users.filter(u => String(u.status || '').toLowerCase().includes('suspend')).length);
    
    const usersList = [
      { label: 'Active', value: Math.max(0, usersCount - suspendedCount), color: '#10b981' },
      { label: 'Suspended', value: suspendedCount, color: '#ef4444' },
    ];

    return { kyc, users: usersList };
  }, [dashboardData, users]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ background: '#C8F032', padding: '8px', borderRadius: '10px' }}><Zap size={20} color="#0A1E28" /></div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, fontFamily: 'Bricolage Grotesque', color: '#0A1E28' }}>System Intelligence</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Real-time platform performance and user growth metrics.</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Last Synced
          </div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0A1E28', fontFamily: 'monospace', marginTop: '2px' }}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Controls Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        {/* Date Range Picker */}
        <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
          <Calendar size={14} />
          <input 
            type="date" 
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: '700', color: '#0A1E28', width: '105px' }} 
            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <span style={{ color: '#cbd5e1' }}>→</span>
          <input 
            type="date" 
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: '700', color: '#0A1E28', width: '105px' }} 
            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
          <button 
            onClick={() => void loadAnalytics()}
            style={{ padding: '4px 12px', borderRadius: '8px', background: '#0A1E28', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '11px', marginLeft: '4px' }}
          >
            Apply
          </button>
        </div>

        <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
          {(['day', 'month', 'year'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: timeframe === t ? 'white' : 'transparent',
                color: timeframe === t ? '#0A1E28' : '#64748b',
                fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize',
                boxShadow: timeframe === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                fontSize: '13px', transition: 'all 0.2s'
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <button 
          onClick={() => void loadAnalytics()} 
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', 
            borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', 
            fontWeight: '600', cursor: 'pointer', color: '#0A1E28'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
        <button 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
            borderRadius: '12px', background: '#0A1E28', color: 'white', 
            fontWeight: '700', cursor: 'pointer', border: 'none' 
          }}
        >
          <Download size={16} />
          Report
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {stats.map((s, idx) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={22} />
              </div>
              {s.trend !== 0 && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', 
                  color: s.trend > 0 ? '#10b981' : '#ef4444', background: s.trend > 0 ? '#dcfce7' : '#fee2e2',
                  padding: '4px 8px', borderRadius: '99px'
                }}>
                  {s.trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(s.trend)}%
                </div>
              )}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0A1E28', marginTop: '6px', fontFamily: 'Bricolage Grotesque' }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Section 1: Volume Activity (Full Width) */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <ActivityChart points={chartPoints} loading={loading} />
        </div>

        {/* Section 2: Distributions & System Health (Side by Side) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '800', color: '#0A1E28', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Bricolage Grotesque' }}>
              <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}><PieChart size={18} color="#3b82f6" /></div>
              Status Distributions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {distributions && (
                <>
                  <DonutMini 
                    title="KYC Compliance" 
                    total={distributions.kyc.reduce((a, b) => a + b.value, 0)} 
                    segments={distributions.kyc} 
                  />
                  <DonutMini 
                    title="User States" 
                    total={distributions.users.reduce((a, b) => a + b.value, 0)} 
                    segments={distributions.users} 
                  />
                </>
              )}
            </div>
          </div>

          <div style={{ background: '#0A1E28', padding: '32px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle at top right, rgba(200, 240, 50, 0.1), transparent)', pointerEvents: 'none' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(200, 240, 50, 0.2)', padding: '10px', borderRadius: '12px' }}><Activity size={20} color="#C8F032" /></div>
              <span style={{ fontWeight: '800', fontSize: '18px', fontFamily: 'Bricolage Grotesque', letterSpacing: '-0.02em' }}>System Health</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'API Gateway Uptime', val: '99.9%', color: '#10b981' },
                { label: 'Transaction Success Rate', val: '98.4%', color: '#10b981' },
                { label: 'Average Server Latency', val: '124ms', color: '#f59e0b' },
              ].map(h => (
                <div key={h.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: '500' }}>{h.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: h.color, fontFamily: 'monospace' }}>{h.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Active Disputes */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque', letterSpacing: '-0.02em' }}>
              Active Disputes ({activeDisputes.length})
            </h3>
            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Required</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Reason</th>
                  <th style={{ padding: '16px 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>User</th>
                  <th style={{ padding: '16px 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {activeDisputes.length > 0 ? (
                  activeDisputes.map((disp, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '700', color: '#0A1E28' }}>{String(disp.reason || disp.subject || 'No reason provided')}</td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: '#64748b' }}>{String(disp.userEmail || disp.user?.fullName || disp.userId || 'Unknown')}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: '#64748b' }}>{disp.createdAt ? new Date(String(disp.createdAt)).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>No active disputes.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Recent Platform Activity (Full Width) */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque', letterSpacing: '-0.02em' }}>Recent Platform Activity</h3>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Audit Log</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Type</th>
                  <th style={{ padding: '16px 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ padding: '16px 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '16px 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.length > 0 ? (
                  recentActivities.map((act, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '700', color: '#0A1E28', textTransform: 'capitalize' }}>{act.type || 'Transaction'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '800', color: '#0A1E28', fontFamily: 'monospace' }}>{act.currency || 'NGN'} {act.amount?.toLocaleString()}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                          background: act.status === 'completed' ? '#ecfdf5' : '#fffbeb',
                          color: act.status === 'completed' ? '#10b981' : '#d97706',
                          textTransform: 'uppercase', letterSpacing: '0.03em'
                        }}>
                          {act.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{new Date(act.createdAt || act.date || Date.now()).toLocaleTimeString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>No recent activity found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={(p) => setPage(p)} 
              isLoading={loading} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAnalyticsPage;