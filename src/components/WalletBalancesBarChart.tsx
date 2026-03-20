import React from 'react';

export type WalletBarPoint = {
  currency: string;
  balance: number;
};

interface WalletBalancesBarChartProps {
  points: WalletBarPoint[];
  loading?: boolean;
  error?: string;
}

const WalletBalancesBarChart: React.FC<WalletBalancesBarChartProps> = ({ points, loading, error }) => {
  const safePoints = Array.isArray(points) ? points : [];
  const total = safePoints.reduce((s, p) => s + (Number(p.balance) > 0 ? Number(p.balance) : 0), 0);

  if (loading) {
    return (
      <div className="utility-card chart-card">
        <h3>Wallet Balances</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="utility-card chart-card">
        <h3>Wallet Balances</h3>
        <p style={{ color: '#c62828' }}>{error}</p>
      </div>
    );
  }

  if (!safePoints.length || total <= 0) {
    return (
      <div className="utility-card chart-card">
        <h3>Wallet Balances</h3>
        <p style={{ color: '#64748B' }}>No wallet balances available.</p>
      </div>
    );
  }

  const colors = ['#C8F032', '#32D4F0', '#F032D4', '#F09E32', '#6D28D9', '#10B981'];

  return (
    <div className="utility-card chart-card">
      <div className="chart-header" style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 18 }}>Wallet Balances</h4>
      </div>

      <div
        style={{
          display: 'flex',
          height: 14,
          width: '100%',
          background: 'rgba(15,23,42,0.06)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
        aria-label="Wallet balances distribution"
      >
        {safePoints
          .filter((p) => Number(p.balance) > 0)
          .map((p, idx) => {
            const pct = total > 0 ? (Number(p.balance) / total) * 100 : 0;
            return (
              <div
                key={`${p.currency}-${idx}`}
                title={`${p.currency}: ${p.balance}`}
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(135deg, ${colors[idx % colors.length]}, rgba(200,240,50,0.15))`,
                  transition: 'width 0.3s ease',
                }}
              />
            );
          })}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          marginTop: 12,
          fontSize: 12,
          color: '#64748B',
        }}
      >
        {safePoints.map((p, idx) => (
          <span key={`${p.currency}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 4,
                background: colors[idx % colors.length],
              }}
            />
            <span style={{ color: '#0A1E28', fontWeight: 600 }}>{p.currency}</span>:
            <span style={{ color: '#0A1E28' }}>{new Intl.NumberFormat('en-NG').format(Number(p.balance) || 0)}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default WalletBalancesBarChart;

