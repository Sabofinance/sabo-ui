import React, { useEffect, useState, useMemo, useRef } from 'react';
import { adminApi } from '../../lib/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Users,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Zap,
  ArrowUpRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  DollarSign,
} from 'lucide-react';
import type { MetricsAnalyticsResponse, Currency } from '../../lib/api/api-contract';

// ─── Formatting helpers (from FRONTEND_INTEGRATION.md §12) ───────────────────

function formatNgn(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n >= 1_000_000_000) return `₦${Math.floor(n / 10_000_000) / 100}B`;
  if (n >= 1_000_000)     return `₦${Math.floor(n / 10_000) / 100}M`;
  if (n >= 1_000)         return `₦${Math.floor(n / 100) / 10}K`;
  return `₦${n.toFixed(2)}`;
}

function formatHours(hours: number | null | string): string {
  if (hours === null || hours === undefined) return '—';
  const h = typeof hours === 'string' ? Number(hours) : hours;
  if (h < 1) return `${Math.round(h * 60)} min`;
  return `${h.toFixed(1)} hrs`;
}

function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Format volume by currency (deposits can be in any currency)
const currencySymbol: Record<Currency, string> = { NGN: '₦', GBP: '£', USD: '$', CAD: 'CA$' };
function formatVolume(value: string, currency: Currency): string {
  if (currency === 'NGN') return formatNgn(value);
  const n = Number(value);
  const sym = currencySymbol[currency];
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${sym}${(n / 1_000).toFixed(1)}K`;
  return `${sym}${n.toFixed(2)}`;
}

// ─── Small reusable components ────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  color?: string;
  highlight?: boolean;
}> = ({ label, value, sub, icon, color = '#3b82f6', highlight = false }) => (
  <div style={{
    background: highlight ? '#0A1E28' : 'white',
    border: `1px solid ${highlight ? 'transparent' : '#e2e8f0'}`,
    borderRadius: '16px',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        color: highlight ? '#94a3b8' : '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>{label}</span>
      {icon && (
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: highlight ? `${color}22` : `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>{icon}</div>
      )}
    </div>
    <div style={{
      fontSize: '26px',
      fontWeight: 800,
      color: highlight ? 'white' : '#0A1E28',
      fontFamily: 'Bricolage Grotesque, sans-serif',
      lineHeight: 1.1,
    }}>{value}</div>
    {sub && <div style={{ fontSize: '12px', color: highlight ? '#64748b' : '#94a3b8' }}>{sub}</div>}
  </div>
);

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; color: string }> = ({ title, icon, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
    <div style={{ background: `${color}18`, padding: '8px', borderRadius: '10px', color }}>{icon}</div>
    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0A1E28', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{title}</h2>
  </div>
);

// Circular gauge (CSS conic-gradient approach)
const CircularGauge: React.FC<{ pct: number; label: string; color?: string; size?: number }> = ({
  pct,
  label,
  color = '#10b981',
  size = 96,
}) => {
  const clamped = Math.min(100, Math.max(0, pct));
  const grad = `conic-gradient(${color} ${clamped * 3.6}deg, #e2e8f0 ${clamped * 3.6}deg)`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: grad, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: size * 0.15, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.18, fontWeight: 800, color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>
          {clamped.toFixed(1)}%
        </div>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{label}</div>
    </div>
  );
};

// ─── SVG Bar + Line combo chart ───────────────────────────────────────────────
interface BarChartSeries {
  color: string;
  label: string;
}

interface BarChartProps {
  data: { label: string; value: number; value2?: number }[];
  series1: BarChartSeries;
  series2?: BarChartSeries;
  /** If true, series2 is rendered as a line overlay instead of grouped bars */
  series2AsLine?: boolean;
  formatValue?: (v: number) => string;
  formatValue2?: (v: number) => string;
  height?: number;
  rotateXLabels?: boolean;
}

function niceMax(raw: number): number {
  if (raw <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  return Math.ceil(raw / mag) * mag;
}

function niceYAxis(max: number, ticks = 4): number[] {
  const step = niceMax(max / ticks);
  return Array.from({ length: ticks + 1 }, (_, i) => i * step);
}

function fmtTick(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  series1,
  series2,
  series2AsLine = false,
  formatValue,
  formatValue2,
  height = 240,
  rotateXLabels = false,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const id = useRef(`bc-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const fmt1 = formatValue  ?? ((v: number) => v.toLocaleString());
  const fmt2 = formatValue2 ?? formatValue ?? ((v: number) => v.toLocaleString());

  // Chart layout constants (in SVG units)
  const W = 600;
  const padL = 48, padR = series2AsLine ? 52 : 16, padT = 20, padB = rotateXLabels ? 72 : 36;
  const innerW = W - padL - padR;
  const innerH = height - padT - padB;

  // Y axis for bars (series1 + series2 when grouped)
  const barMax = series2AsLine
    ? Math.max(...data.map(d => d.value), 1)
    : Math.max(...data.map(d => Math.max(d.value, d.value2 ?? 0)), 1);
  const barTicks = niceYAxis(barMax);
  const yMax = barTicks[barTicks.length - 1] || 1;

  // Y axis for line (series2, separate scale when line overlay)
  const lineMax = series2AsLine ? Math.max(...data.map(d => d.value2 ?? 0), 1) : 0;
  const lineTicks = series2AsLine ? niceYAxis(lineMax) : [];
  const yLineMax = lineTicks[lineTicks.length - 1] || 1;

  const groupW = innerW / data.length;
  const barPad = groupW * 0.28;
  const innerGroupW = groupW - barPad;
  const barsPerGroup = series2 && !series2AsLine ? 2 : 1;
  const gap = barsPerGroup > 1 ? 3 : 0;
  const barW = (innerGroupW - gap * (barsPerGroup - 1)) / barsPerGroup;

  const toBarY  = (v: number) => padT + innerH - (v / yMax) * innerH;
  const toLineY = (v: number) => padT + innerH - (v / yLineMax) * innerH;

  // Line path for series2
  const linePath = useMemo(() => {
    if (!series2AsLine || !series2) return '';
    return data.map((d, i) => {
      const x = padL + i * groupW + groupW / 2;
      const y = toLineY(d.value2 ?? 0);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [data, series2AsLine, yLineMax]);

  if (data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        style={{ width: '100%', display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={`${id}-g1`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={series1.color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={series1.color} stopOpacity="0.55" />
          </linearGradient>
          {series2 && !series2AsLine && (
            <linearGradient id={`${id}-g2`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={series2.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={series2.color} stopOpacity="0.55" />
            </linearGradient>
          )}
          {/* Hover column highlight */}
          <linearGradient id={`${id}-hover`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0A1E28" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0A1E28" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* ── Left Y-axis grid + labels (bars) ── */}
        {barTicks.map((tick, i) => {
          const y = toBarY(tick);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke={i === 0 ? '#e2e8f0' : '#f1f5f9'} strokeWidth={i === 0 ? 1.5 : 1} strokeDasharray={i === 0 ? '' : '3 3'} />
              <text x={padL - 6} y={y} textAnchor="end" dominantBaseline="middle"
                fontSize="9" fill="#94a3b8" fontWeight="700" fontFamily="DM Sans, sans-serif">
                {fmtTick(tick)}
              </text>
            </g>
          );
        })}

        {/* ── Right Y-axis labels (line series) ── */}
        {series2AsLine && series2 && lineTicks.map((tick, i) => {
          const y = toLineY(tick);
          return (
            <text key={i} x={W - padR + 6} y={y} textAnchor="start" dominantBaseline="middle"
              fontSize="9" fill={series2.color} fontWeight="700" fontFamily="DM Sans, sans-serif">
              {fmtTick(tick)}
            </text>
          );
        })}

        {/* ── Bars ── */}
        {data.map((d, i) => {
          const gx = padL + i * groupW + barPad / 2;
          const isH = hovered === i;

          const x1 = gx;
          const h1 = mounted ? Math.max((d.value / yMax) * innerH, d.value > 0 ? 2 : 0) : 0;
          const y1 = padT + innerH - h1;

          const x2 = series2 && !series2AsLine ? gx + barW + gap : 0;
          const h2 = series2 && !series2AsLine && mounted
            ? Math.max(((d.value2 ?? 0) / yMax) * innerH, (d.value2 ?? 0) > 0 ? 2 : 0)
            : 0;
          const y2 = padT + innerH - h2;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: 'default' }}>
              {/* Hover column */}
              <rect
                x={padL + i * groupW}
                y={padT}
                width={groupW}
                height={innerH}
                fill={isH ? `url(#${id}-hover)` : 'transparent'}
                rx="4"
              />

              {/* Bar 1 */}
              <rect
                x={x1} y={y1} width={barW} height={h1}
                fill={`url(#${id}-g1)`} rx="4"
                style={{ transition: 'height 0.6s cubic-bezier(0.34,1.26,0.64,1), y 0.6s cubic-bezier(0.34,1.26,0.64,1)' }}
              />
              {/* Bar 1 top highlight */}
              {h1 > 6 && <rect x={x1} y={y1} width={barW} height={3} fill={series1.color} rx="4" opacity="0.4" />}

              {/* Bar 2 (grouped mode) */}
              {series2 && !series2AsLine && (
                <>
                  <rect
                    x={x2} y={y2} width={barW} height={h2}
                    fill={`url(#${id}-g2)`} rx="4"
                    style={{ transition: 'height 0.6s cubic-bezier(0.34,1.26,0.64,1), y 0.6s cubic-bezier(0.34,1.26,0.64,1)' }}
                  />
                  {h2 > 6 && <rect x={x2} y={y2} width={barW} height={3} fill={series2.color} rx="4" opacity="0.4" />}
                </>
              )}

              {/* Value labels on hover */}
              {isH && d.value > 0 && (
                <text x={x1 + barW / 2} y={y1 - 5} textAnchor="middle"
                  fontSize="8.5" fill={series1.color} fontWeight="800" fontFamily="DM Sans, sans-serif">
                  {fmt1(d.value)}
                </text>
              )}
              {isH && series2 && !series2AsLine && (d.value2 ?? 0) > 0 && (
                <text x={x2 + barW / 2} y={y2 - 5} textAnchor="middle"
                  fontSize="8.5" fill={series2.color} fontWeight="800" fontFamily="DM Sans, sans-serif">
                  {fmt2(d.value2 ?? 0)}
                </text>
              )}

              {/* Line value label on hover */}
              {isH && series2AsLine && series2 && (d.value2 ?? 0) > 0 && (
                <text
                  x={padL + i * groupW + groupW / 2}
                  y={toLineY(d.value2 ?? 0) - 8}
                  textAnchor="middle"
                  fontSize="8.5" fill={series2.color} fontWeight="800" fontFamily="DM Sans, sans-serif">
                  {fmt2(d.value2 ?? 0)}
                </text>
              )}

              {/* X label */}
              {rotateXLabels ? (
                <text
                  x={padL + i * groupW + groupW / 2}
                  y={padT + innerH + 8}
                  textAnchor="end"
                  fontSize="9"
                  fill={isH ? '#0A1E28' : '#94a3b8'}
                  fontWeight={isH ? '800' : '600'}
                  fontFamily="DM Sans, sans-serif"
                  transform={`rotate(-90, ${padL + i * groupW + groupW / 2}, ${padT + innerH + 8})`}
                >
                  {d.label}
                </text>
              ) : (
                <text
                  x={padL + i * groupW + groupW / 2}
                  y={padT + innerH + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isH ? '#0A1E28' : '#94a3b8'}
                  fontWeight={isH ? '800' : '600'}
                  fontFamily="DM Sans, sans-serif"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Line overlay (series2 as line) ── */}
        {series2AsLine && series2 && mounted && (
          <>
            {/* Area fill under line */}
            <path
              d={`${linePath} L ${(padL + (data.length - 1) * groupW + groupW / 2).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${(padL + groupW / 2).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`}
              fill={series2.color}
              fillOpacity="0.06"
            />
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={series2.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ transition: 'opacity 0.4s' }}
            />
            {/* Dots */}
            {data.map((d, i) => {
              const cx = padL + i * groupW + groupW / 2;
              const cy = toLineY(d.value2 ?? 0);
              const isH = hovered === i;
              return (
                <circle
                  key={i}
                  cx={cx} cy={cy}
                  r={isH ? 5 : 3}
                  fill={isH ? series2.color : '#fff'}
                  stroke={series2.color}
                  strokeWidth="2.5"
                  style={{ transition: 'r 0.15s' }}
                />
              );
            })}
          </>
        )}

        {/* ── Hover tooltip card ── */}
        {hovered !== null && (() => {
          const d = data[hovered];
          const cx = padL + hovered * groupW + groupW / 2;
          const tipW = series2 ? 110 : 80;
          const tipH = series2 ? 56 : 38;
          const tipX = Math.min(Math.max(cx - tipW / 2, padL), W - padR - tipW);
          const tipY = padT - tipH - 8;
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="8" fill="#0A1E28" />
              <text x={tipX + 10} y={tipY + 14} fontSize="9" fill="#94a3b8" fontWeight="700" fontFamily="DM Sans, sans-serif">{d.label}</text>
              <circle cx={tipX + 10} cy={tipY + 28} r="3" fill={series1.color} />
              <text x={tipX + 16} y={tipY + 28} dominantBaseline="middle" fontSize="9" fill="#fff" fontWeight="800" fontFamily="DM Sans, sans-serif">{fmt1(d.value)}</text>
              {series2 && d.value2 !== undefined && (
                <>
                  <circle cx={tipX + 10} cy={tipY + 44} r="3" fill={series2.color} />
                  <text x={tipX + 16} y={tipY + 44} dominantBaseline="middle" fontSize="9" fill="#fff" fontWeight="800" fontFamily="DM Sans, sans-serif">{fmt2(d.value2)}</text>
                </>
              )}
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '4px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: series1.color }} />
          {series1.label}
        </div>
        {series2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {series2AsLine
              ? <span style={{ display: 'inline-block', width: 20, height: 3, borderRadius: 2, background: series2.color, verticalAlign: 'middle' }} />
              : <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: series2.color }} />
            }
            {series2.label}
          </div>
        )}
      </div>
    </div>
  );
};

// Currency badge
const currencyColor: Record<Currency, string> = {
  NGN: '#f59e0b',
  GBP: '#6366f1',
  USD: '#10b981',
  CAD: '#ef4444',
};

const CurrencyBadge: React.FC<{ currency: Currency }> = ({ currency }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 800,
    background: `${currencyColor[currency]}20`,
    color: currencyColor[currency],
  }}>{currency}</span>
);

// Dispute rate color
function disputeRateColor(pct: number): string {
  if (pct < 1) return '#10b981';
  if (pct <= 3) return '#f59e0b';
  return '#ef4444';
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminMetricsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MetricsAnalyticsResponse | null>(null);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [growthFilter, setGrowthFilter] = useState<'7d' | '4w' | '12m' | 'launch'>('12m');

  // Derive from/to based on growth filter.
  // Anchors match the backend's canonical defaults (§5.8):
  //   day    → 6 days ago  → 7 buckets (today inclusive, Mon–Sun aligned)
  //   week   → 21 days ago → 4 calendar-week buckets (not 28, which splits into 5)
  //   month  → 11 months ago → 12 monthly buckets (not 12, which can produce 13)
  //   launch → from=2023-10-01 (no to override) → all monthly buckets since launch
  const growthWindow = useMemo((): { from: string; to?: string; granularity: string } => {
    const now = new Date();
    const to = now.toISOString();
    if (growthFilter === '7d') {
      const from = new Date(now); from.setDate(from.getDate() - 6);
      return { from: from.toISOString(), to, granularity: 'day' };
    }
    if (growthFilter === '4w') {
      const from = new Date(now); from.setDate(from.getDate() - 21);
      return { from: from.toISOString(), to, granularity: 'week' };
    }
    if (growthFilter === 'launch') {
      return { from: '2023-10-01T00:00:00.000Z', granularity: 'month' };
    }
    // '12m'
    const from = new Date(now); from.setMonth(from.getMonth() - 11);
    return { from: from.toISOString(), to, granularity: 'month' };
  }, [growthFilter]);

  const fetchMetrics = async (window?: { from: string; to?: string; granularity: string }) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {};
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo)   params.to   = new Date(dateTo).toISOString();
      // Growth chart params (always sent)
      const gw = window ?? growthWindow;
      params.granularity = gw.granularity;
      if (!params.from) params.from = gw.from;
      if (!params.to)   params.to   = gw.to;

      const res = await adminApi.getAnalyticsMetrics(params);
      if (res.success && res.data) {
        setData(res.data as MetricsAnalyticsResponse);
      } else {
        setError({ code: res.error?.code, message: res.error?.message ?? 'Failed to load metrics' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error loading metrics';
      setError({ message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchMetrics(growthWindow); }, [growthWindow]);

  // ── Growth chart data — labels come pre-formatted from the backend ──
  const userGrowthChart = useMemo(() =>
    (data?.growth.user_growth_monthly ?? []).map(m => ({
      label: m.label,
      value: m.new_users,
      value2: m.cumulative_users,
    })),
  [data]);

  const tradeVolumeChart = useMemo(() =>
    (data?.growth.trade_volume_monthly ?? []).map(m => ({
      label: m.label,
      value: m.completed_trades,
      value2: Number(m.cumulative_ngn_volume),
    })),
  [data]);

  const card = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.3 },
  });

  const section = {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    marginBottom: '24px',
  };

  const grid4: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#C8F032' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading metrics…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap'); @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ background: '#C8F032', padding: '8px', borderRadius: '10px' }}><BarChart3 size={20} color="#0A1E28" /></div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, fontFamily: 'Bricolage Grotesque, sans-serif', color: '#0A1E28' }}>Platform Metrics</h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Comprehensive analytics... {data ? `generated ${new Date(data.generated_at).toLocaleString()}` : 'All time'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '6px 12px', fontSize: '12px', color: '#64748b' }}>
            <span>From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 700, color: '#0A1E28' }} />
            <span>→</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 700, color: '#0A1E28' }} />
            <button onClick={() => void fetchMetrics()}
              style={{ padding: '4px 10px', borderRadius: '8px', background: '#0A1E28', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}>
              Apply
            </button>
          </div>
          <button onClick={() => void fetchMetrics()} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer', color: '#0A1E28', fontSize: '13px' }}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Refresh
          </button>
        </div>
      </div>

      {/* ════════════════ USERS SECTION ════════════════ */}
      <motion.div {...card(0)} style={section}>
        <SectionHeader title="Users" icon={<Users size={18} />} color="#3b82f6" />

        {/* ── User snapshot panel ── */}
        <div style={{
          background: '#0A1E28',
          borderRadius: '16px',
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '4px',
        }}>
          {[
            { label: 'Total Registered', value: data?.users.total_registered,    sub: 'All time',                     icon: <Users size={15} /> },
            { label: 'Active Users',     value: data?.users.total_active,         sub: 'KYC-verified & not suspended', icon: <CheckCircle size={15} /> },
            { label: 'Suspended',        value: data?.users.total_suspended,      sub: null,                           icon: <AlertCircle size={15} /> },
            { label: 'At Launch',        value: data?.users.users_at_launch,      sub: null,              icon: <Activity size={15} /> },
            { label: 'Monthly Active',   value: data?.users.monthly_active_users, sub: 'Last 30 days · live',          icon: <Activity size={15} /> },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              padding: '20px',
              borderRadius: '12px',
              background: '#0f2535',
              borderRight: i < arr.length - 1 ? '1px solid #1e3a4a' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                {stat.icon}
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif', lineHeight: 1 }}>
                {stat.value?.toLocaleString() ?? '—'}
              </div>
              {stat.sub && <div style={{ fontSize: '11px', color: '#C8F032', fontWeight: 600 }}>{stat.sub}</div>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ════════════════ KYC SECTION ════════════════ */}
      <motion.div {...card(0.05)} style={section}>
        <SectionHeader title="KYC" icon={<ShieldCheck size={18} />} color="#8b5cf6" />
        <div style={grid4}>
          <StatCard
            label="Avg Verification"
            value={data ? formatHours(data.kyc.avg_verification_hours) : '—'}
            sub={data?.kyc.avg_verification_hours_note ?? undefined}
            icon={<Clock size={16} />}
            color="#8b5cf6"
          />
          <StatCard
            label="Median Verification"
            value={data ? formatHours(data.kyc.median_verification_hours) : '—'}
            icon={<Clock size={16} />}
            color="#8b5cf6"
          />
          <StatCard
            label="KYC Dropoff Rate"
            value={data ? formatPct(data.kyc.dropoff.dropoff_rate_pct) : '—'}
            sub={`${data?.kyc.dropoff.never_submitted ?? 0} never submitted`}
            icon={<AlertCircle size={16} />}
            color={data && data.kyc.dropoff.dropoff_rate_pct > 10 ? '#ef4444' : '#f59e0b'}
          />
          <StatCard
            label="Total Submissions"
            value={data?.kyc.total_submissions.toLocaleString() ?? '—'}
            sub={`${data?.kyc.verified_submissions ?? 0} verified · ${data?.kyc.rejected_submissions ?? 0} rejected`}
            icon={<BarChart3 size={16} />}
            color="#3b82f6"
          />
        </div>

        {data && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            {/* Verified users breakdown */}
            <CircularGauge
              pct={data.users.kyc.verified_pct}
              label="KYC Verified"
              color="#10b981"
            />
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1E28', marginBottom: '12px' }}>User KYC Status</div>
              {[
                { label: 'Verified',   count: data.users.kyc.verified,   total: data.users.total_registered, color: '#10b981' },
                { label: 'Pending',    count: data.users.kyc.pending,    total: data.users.total_registered, color: '#f59e0b' },
                { label: 'Rejected',   count: data.users.kyc.rejected,   total: data.users.total_registered, color: '#ef4444' },
                { label: 'Unverified', count: data.users.kyc.unverified, total: data.users.total_registered, color: '#94a3b8' },
              ].map(b => {
                const pct = data.users.total_registered > 0 ? (b.count / data.users.total_registered) * 100 : 0;
                return (
                  <div key={b.label} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                      <span>{b.label}</span>
                      <span style={{ color: '#0A1E28', fontWeight: 700 }}>{b.count.toLocaleString()} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: b.color, borderRadius: '99px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* ════════════════ TRADES SECTION ════════════════ */}
      <motion.div {...card(0.1)} style={section}>
        <SectionHeader title="Trades" icon={<TrendingUp size={18} />} color="#10b981" />

        {/* Hero: lifetime NGN volume */}
        {data && (
          <div style={{ background: '#0A1E28', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Lifetime NGN Volume</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{formatNgn(data.trades.lifetime_ngn_volume)}</div>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Avg Trade Size</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#C8F032', fontFamily: 'Bricolage Grotesque' }}>{formatNgn(data.trades.avg_trade_size_ngn)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Avg Settlement</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#C8F032', fontFamily: 'Bricolage Grotesque' }}>{formatHours(data.trades.avg_settlement_hours)}</div>
              </div>
            </div>
          </div>
        )}

        <div style={grid4}>
          <StatCard label="Total Initiated" value={data?.trades.total_initiated.toLocaleString() ?? '—'} icon={<Activity size={16} />} color="#3b82f6" />
          <StatCard label="Completed" value={data?.trades.total_completed.toLocaleString() ?? '—'} icon={<CheckCircle size={16} />} color="#10b981" />
          <StatCard label="Cancelled" value={data?.trades.total_cancelled.toLocaleString() ?? '—'} icon={<AlertCircle size={16} />} color="#f59e0b" />
          <StatCard label="Disputed" value={data?.trades.total_disputed.toLocaleString() ?? '—'} icon={<AlertCircle size={16} />} color="#ef4444" />
        </div>

        {data && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CircularGauge pct={data.trades.success_rate_pct} label="Success Rate" color="#10b981" />
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>Target ≥ 95%</div>
            </div>

            {/* by_currency breakdown */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1E28', marginBottom: '12px' }}>By Currency</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                      {['Currency', 'Completed', 'Volume (NGN)', 'Avg Size', 'Settlement'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.trades.by_currency.map(row => (
                      <tr key={row.currency} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 12px' }}><CurrencyBadge currency={row.currency} /></td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0A1E28' }}>{row.completed_trades.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>{formatNgn(row.lifetime_ngn_volume)}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{formatNgn(row.avg_trade_size_ngn)}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{formatHours(row.avg_settlement_hours)}</td>
                      </tr>
                    ))}
                    {data.trades.by_currency.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '20px 12px', textAlign: 'center', color: '#94a3b8' }}>No currency data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ════════════════ P2P SECTION ════════════════ */}
      <motion.div {...card(0.15)} style={section}>
        <SectionHeader title="P2P Marketplace" icon={<ArrowUpRight size={18} />} color="#f59e0b" />
        <div style={grid4}>
          <StatCard label="Active Listings" value={data?.p2p.active_listings.toLocaleString() ?? '—'} sub="Currently live" icon={<Activity size={16} />} color="#f59e0b" />
          <StatCard label="Total Sellers" value={data?.p2p.total_sellers.toLocaleString() ?? '—'} icon={<Users size={16} />} color="#3b82f6" />
          <StatCard label="Total Buyers" value={data?.p2p.total_buyers.toLocaleString() ?? '—'} icon={<Users size={16} />} color="#8b5cf6" />
          <StatCard label="Repeat Traders" value={data?.p2p.repeat_traders.toLocaleString() ?? '—'} sub={data ? `${formatPct(data.p2p.repeat_rate_pct)} repeat rate` : undefined} icon={<TrendingUp size={16} />} color="#10b981" />
        </div>

        {data && (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            {/* Dispute rate */}
            <div style={{
              flex: 1,
              minWidth: '180px',
              padding: '16px',
              borderRadius: '14px',
              background: `${disputeRateColor(data.p2p.dispute_rate_pct)}10`,
              border: `1px solid ${disputeRateColor(data.p2p.dispute_rate_pct)}30`,
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: disputeRateColor(data.p2p.dispute_rate_pct), marginBottom: '4px' }}>Dispute Rate</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0A1E28', fontFamily: 'Bricolage Grotesque' }}>{formatPct(data.p2p.dispute_rate_pct)}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Green &lt;1% · Amber 1–3% · Red &gt;3%</div>
            </div>

            {/* Dispute breakdown */}
            <div style={{ flex: 2, minWidth: '220px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1E28', marginBottom: '12px' }}>Disputes: {data.p2p.disputes.total}</div>
              {[
                { label: 'Open', count: data.p2p.disputes.open, color: '#ef4444' },
                { label: 'Resolved', count: data.p2p.disputes.resolved, color: '#10b981' },
              ].map(d => {
                const pct = data.p2p.disputes.total > 0 ? (d.count / data.p2p.disputes.total) * 100 : 0;
                return (
                  <div key={d.label} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                      <span>{d.label}</span>
                      <span style={{ color: '#0A1E28', fontWeight: 700 }}>{d.count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: d.color, borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Repeat vs one-time */}
            <div style={{ flex: 1, minWidth: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CircularGauge pct={data.p2p.repeat_rate_pct} label="Repeat Traders" color="#f59e0b" size={80} />
            </div>
          </div>
        )}
      </motion.div>

      {/* ════════════════ ESCROW SECTION ════════════════ */}
      <motion.div {...card(0.2)} style={section}>
        <SectionHeader title="Escrow" icon={<DollarSign size={18} />} color="#10b981" />

        {data && (
          <div style={{ background: 'linear-gradient(135deg, #0A1E28, #1a3344)', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {/* Two volume heroes */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Lifetime Escrow Volume</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', fontFamily: 'Bricolage Grotesque' }}>{formatNgn(data.escrow.lifetime_volume_ngn)}</div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>completed + escrowed + disputed</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Current Escrow Volume
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#C8F032', boxShadow: '0 0 6px #C8F032', animation: 'pulse 2s ease-in-out infinite' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#C8F032', fontFamily: 'Bricolage Grotesque' }}>{formatNgn(data.escrow.current_volume_ngn)}</div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>locked right now</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Currently Escrowed</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#C8F032', fontFamily: 'Bricolage Grotesque' }}>{data.escrow.currently_escrowed_trades}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>active trades · live</div>
              </div>
              <CircularGauge pct={data.escrow.completion_rate_pct} label="Completion" color="#C8F032" size={72} />
            </div>
          </div>
        )}

        {/* Live TVL by currency */}
        {data && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1E28', marginBottom: '12px' }}>Live TVL by Currency</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {data.escrow.live_tvl_by_currency.map(e => (
                <div key={e.currency} style={{ padding: '16px', borderRadius: '12px', background: `${currencyColor[e.currency]}10`, border: `1px solid ${currencyColor[e.currency]}30`, textAlign: 'center' }}>
                  <CurrencyBadge currency={e.currency} />
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0A1E28', fontFamily: 'Bricolage Grotesque', marginTop: '8px' }}>
                    {Number(e.locked_value).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>locked</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ════════════════ DEPOSITS SECTION ════════════════ */}
      <motion.div {...card(0.25)} style={section}>
        <SectionHeader title="Deposits" icon={<Zap size={18} />} color="#6366f1" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                {['Currency', 'Total', 'Completed', 'Pending', 'Rejected', 'Confirmed Volume'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.deposits.by_currency ?? []).map(row => (
                <tr key={row.currency} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 16px' }}><CurrencyBadge currency={row.currency} /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0A1E28' }}>{row.total_deposits.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700 }}>{row.completed_deposits.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#f59e0b', fontWeight: 700 }}>{row.pending_deposits.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: 700 }}>{row.rejected_deposits.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{formatVolume(row.total_volume, row.currency)}</td>
                </tr>
              ))}
              {(!data || data.deposits.by_currency.length === 0) && (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No deposit data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ════════════════ GROWTH SECTION ════════════════ */}
      <motion.div {...card(0.3)} style={section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <SectionHeader title="Growth" icon={<TrendingUp size={18} />} color="#f59e0b" />
          <div style={{ display: 'flex', gap: '6px', background: '#f8fafc', borderRadius: '10px', padding: '4px' }}>
            {(['7d', '4w', '12m', 'launch'] as const).map(f => (
              <button
                key={f}
                onClick={() => setGrowthFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700,
                  background: growthFilter === f ? '#0A1E28' : 'transparent',
                  color: growthFilter === f ? '#C8F032' : '#94a3b8',
                  transition: 'all 0.2s',
                }}
              >
                {f === '7d' ? '7 Days' : f === '4w' ? '4 Weeks' : f === '12m' ? '12 Months' : 'Since Launch'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A1E28', marginBottom: '4px', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              User Growth — {growthFilter === '7d' ? 'Daily (this week)' : growthFilter === '4w' ? 'Weekly (this month)' : growthFilter === '12m' ? 'Monthly (last 12 months)' : 'Monthly (since launch)'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
              {growthFilter === '7d' ? 'New registrations per day with cumulative overlay' : growthFilter === '4w' ? 'New registrations per week with cumulative overlay' : growthFilter === '12m' ? 'New registrations per month with cumulative total overlay' : 'All-time monthly registrations from Oct 2023 with cumulative overlay'}
            </div>
            <BarChart
              data={userGrowthChart}
              series1={{ color: '#3b82f6', label: 'New Users' }}
              series2={{ color: '#10b981', label: 'Cumulative Users' }}
              series2AsLine
              formatValue={v => v.toLocaleString()}
              height={260}
              rotateXLabels={growthFilter === 'launch'}
            />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A1E28', marginBottom: '4px', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Trade Volume — {growthFilter === '7d' ? 'Daily (this week)' : growthFilter === '4w' ? 'Weekly (this month)' : growthFilter === '12m' ? 'Monthly (last 12 months)' : 'Monthly (since launch)'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
              {growthFilter === '7d' ? 'Completed trades per day with cumulative NGN volume' : growthFilter === '4w' ? 'Completed trades per week with cumulative NGN volume' : growthFilter === '12m' ? 'Completed trades per month with cumulative NGN volume' : 'All-time monthly trade volume from Oct 2023 (cumulative)'}
            </div>
            <BarChart
              data={tradeVolumeChart}
              series1={{ color: '#f59e0b', label: 'Completed Trades' }}
              series2={{ color: '#8b5cf6', label: 'Cumulative Volume' }}
              series2AsLine
              formatValue={v => v.toLocaleString()}
              formatValue2={v => formatNgn(v)}
              height={260}
              rotateXLabels={growthFilter === 'launch'}
            />
          </div>
        </div>
      </motion.div>

      {/* ════════════════ PLATFORM CONSTANTS ════════════════ */}
      {data && (
        <motion.div {...card(0.35)} style={{ ...section, marginBottom: 0 }}>
          <SectionHeader title="Platform Info" icon={<Zap size={18} />} color="#94a3b8" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
            {[
              { label: 'PIN Window', value: `${data.platform.pin_confirmation_window_minutes} min` },
              { label: 'Bid Expiry', value: `${data.platform.bid_expiry_hours} hrs` },
              { label: 'Background Jobs', value: String(data.platform.background_jobs_count) },
              { label: 'KYC Process', value: data.platform.kyc_process.replace(/_/g, ' ') },
              { label: 'NGN Deposit', value: data.platform.deposit_ngn_provider },
              { label: 'Foreign Deposit', value: data.platform.deposit_foreign_process.replace(/_/g, ' ') },
            ].map(item => (
              <div key={item.label} style={{ padding: '12px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: '#0A1E28', textTransform: 'capitalize' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Supported Currencies:</span>
            {data.platform.supported_currencies.map(c => <CurrencyBadge key={c} currency={c} />)}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminMetricsPage;
