import React from 'react';

export type ConversionTrendPoint = {
  day: string;
  value: number;
};

interface ConversionsTrendBarChartProps {
  points: ConversionTrendPoint[];
  loading?: boolean;
  error?: string;
}

const ConversionsTrendBarChart: React.FC<ConversionsTrendBarChartProps> = ({ points, loading, error }) => {
  const safePoints = Array.isArray(points) ? points : [];
  const maxValue = safePoints.length ? Math.max(...safePoints.map((p) => Number(p.value) || 0)) : 0;

  if (loading) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Conversion Trend</h4>
        </div>
        <p>Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Conversion Trend</h4>
        </div>
        <p style={{ color: '#c62828' }}>{error}</p>
      </div>
    );
  }

  if (!safePoints.length || maxValue <= 0) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Conversion Trend</h4>
        </div>
        <p style={{ color: '#64748B' }}>No conversion trend data available.</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value.toFixed(0)}`;
  };

  const scale = (v: number) => ((Number(v) || 0) / maxValue) * 120;

  return (
    <div className="utility-card chart-card">
      <div className="chart-header">
        <h4>Conversion Trend (Last 7 Days)</h4>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          Total: {formatCurrency(safePoints.reduce((s, p) => s + (Number(p.value) || 0), 0))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 160 }}>
        {safePoints.map((p, i) => {
          const h = scale(p.value);
          return (
            <div
              key={`${p.day}-${i}`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <div
                title={`${p.day}: ${formatCurrency(p.value)}`}
                style={{
                  width: 14,
                  height: h,
                  borderRadius: 7,
                  background: 'linear-gradient(180deg, #10B981 0%, rgba(16,185,129,0.35) 100%)',
                }}
              />
              <div style={{ fontSize: 11, color: '#64748B' }}>{p.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionsTrendBarChart;

