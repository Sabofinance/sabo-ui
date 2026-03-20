import React from 'react';
import type { ActivityChartPoint } from './ActivityChart';

interface LedgerVolumeAreaChartProps {
  points: ActivityChartPoint[];
  loading?: boolean;
  error?: string;
}

const LedgerVolumeAreaChart: React.FC<LedgerVolumeAreaChartProps> = ({ points, loading, error }) => {
  const safePoints = Array.isArray(points) ? points : [];
  const maxVolume = safePoints.length ? Math.max(...safePoints.map((d) => Number(d.volume) || 0)) : 0;

  if (loading) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Transactions Volume</h4>
        </div>
        <p>Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Transactions Volume</h4>
        </div>
        <p style={{ color: '#c62828' }}>{error}</p>
      </div>
    );
  }

  if (!safePoints.length || maxVolume <= 0) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Transactions Volume</h4>
        </div>
        <p style={{ color: '#64748B' }}>No transaction volume data available.</p>
      </div>
    );
  }

  const width = 520;
  const height = 150;
  const padX = 24;
  const padY = 18;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const bottomY = padY + chartH;

  const toX = (i: number) => padX + (safePoints.length === 1 ? 0 : (i / (safePoints.length - 1)) * chartW);
  const toY = (v: number) => padY + (1 - (v / maxVolume || 0)) * chartH;

  const areaPoints = safePoints
    .map((p, i) => `${toX(i)},${toY(Number(p.volume) || 0)}`)
    .join(' ');

  const areaPolygon = `${areaPoints} ${toX(safePoints.length - 1)},${bottomY} ${toX(0)},${bottomY}`;

  const linePoints = safePoints.map((p, i) => `${toX(i)},${toY(Number(p.volume) || 0)}`).join(' ');

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value.toFixed(0)}`;
  };

  return (
    <div className="utility-card chart-card">
      <div className="chart-header">
        <h4>Transactions Volume (Last 7 Days)</h4>
        <div style={{ fontSize: 12, color: '#64748B' }}>Total: {formatCurrency(safePoints.reduce((s, p) => s + (Number(p.volume) || 0), 0))}</div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={160} role="img" aria-label="Transactions volume area chart">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A1E28" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0A1E28" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <polygon points={areaPolygon} fill="url(#areaGrad)" stroke="none" />

        {/* Line */}
        <polyline points={linePoints} fill="none" stroke="#C8F032" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points + tooltips (title) */}
        {safePoints.map((p, i) => {
          const x = toX(i);
          const y = toY(Number(p.volume) || 0);
          return (
            <g key={`${p.day}-${i}`}>
              <circle cx={x} cy={y} r={4} fill="#C8F032" />
              <title>
                {p.day}: {formatCurrency(Number(p.volume) || 0)}
              </title>
            </g>
          );
        })}

        {/* X labels */}
        {safePoints.map((p, i) => {
          const x = toX(i);
          // Avoid clutter: show roughly 5 ticks
          const show = safePoints.length <= 5 || i === 0 || i === safePoints.length - 1 || i % 2 === 0;
          if (!show) return null;
          return (
            <text key={`label-${p.day}-${i}`} x={x} y={bottomY + 18} textAnchor="middle" fontSize="11" fill="#64748B">
              {p.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default LedgerVolumeAreaChart;

