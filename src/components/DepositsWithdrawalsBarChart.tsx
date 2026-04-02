import React from 'react';

export type DepositsWithdrawalsPoint = {
  day: string;
  deposits: number;
  withdrawals: number;
};

interface DepositsWithdrawalsBarChartProps {
  points: DepositsWithdrawalsPoint[];
  loading?: boolean;
  error?: string;
}

const DepositsWithdrawalsBarChart: React.FC<DepositsWithdrawalsBarChartProps> = ({ points, loading, error }) => {
  const safePoints = Array.isArray(points) ? points : [];
  const maxValue = safePoints.length
    ? Math.max(
        ...safePoints.map((p) => Math.max(Number(p.deposits) || 0, Number(p.withdrawals) || 0)),
      )
    : 0;

  if (loading) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Deposits vs Withdrawals</h4>
        </div>
        <p>Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Deposits vs Withdrawals</h4>
        </div>
        <p style={{ color: '#c62828' }}>{error}</p>
      </div>
    );
  }

  if (!safePoints.length) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>Deposits vs Withdrawals</h4>
        </div>
        <p style={{ color: '#64748B' }}>No deposits/withdrawals data available.</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value.toFixed(0)}`;
  };

  const depositsTotal = safePoints.reduce((s, p) => s + (Number(p.deposits) || 0), 0);
  const withdrawalsTotal = safePoints.reduce((s, p) => s + (Number(p.withdrawals) || 0), 0);

  const maxValueForScale = maxValue > 0 ? maxValue : 1;
  const scale = (v: number) => ((Number(v) || 0) / maxValueForScale) * 120;

  return (
    <div className="utility-card chart-card">
      <div className="chart-header">
        <h4>Deposits vs Withdrawals (Last 7 Days)</h4>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748B' }}>
          <span>Deposits: {formatCurrency(depositsTotal)}</span>
          <span>Withdrawals: {formatCurrency(withdrawalsTotal)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 160 }}>
        {safePoints.map((p, i) => {
          const depH = scale(p.deposits);
          const wH = scale(p.withdrawals);
          return (
            <div
              key={`${p.day}-${i}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div
                  title={`${p.day} deposits: ${formatCurrency(p.deposits)}`}
                  style={{
                    width: 24,
                    height: depH,
                    borderRadius: 8,
                    background: 'linear-gradient(180deg, #32D4F0 0%, rgba(50,212,240,0.35) 100%)',
                  }}
                />
                <div
                  title={`${p.day} withdrawals: ${formatCurrency(p.withdrawals)}`}
                  style={{
                    width: 24,
                    height: wH,
                    borderRadius: 8,
                    background: 'linear-gradient(180deg, #F032D4 0%, rgba(240,50,212,0.35) 100%)',
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: '#64748B' }}>{p.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepositsWithdrawalsBarChart;

