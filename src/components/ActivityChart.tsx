import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import '../assets/css/ActivityChart.css';

export type ActivityChartPoint = {
  day: string;
  trades: number;
  volume: number;
};

interface ActivityChartProps {
  points: ActivityChartPoint[];
  loading?: boolean;
  error?: string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ points, loading, error }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const safePoints = Array.isArray(points) ? points : [];
  const maxVolume = safePoints.length ? Math.max(...safePoints.map((d) => d.volume)) : 0;
  const maxTrades = safePoints.length ? Math.max(...safePoints.map((d) => d.trades)) : 0;

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value.toLocaleString()}`;
  };

  const totalTrades = safePoints.reduce((sum, d) => sum + d.trades, 0);
  const totalVolume = safePoints.reduce((sum, d) => sum + d.volume, 0);
  const avgPerTrade = totalTrades > 0 ? totalVolume / totalTrades : 0;
  const activeTraders = totalTrades > 0 ? Math.max(1, Math.round(totalTrades / 6)) : 0;

  if (loading) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>📊 Trading Activity</h4>
        </div>
        <div className="chart-container">
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>📊 Trading Activity</h4>
        </div>
        <div className="chart-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!safePoints.length) {
    return (
      <div className="utility-card chart-card" style={{ padding: '24px', borderRadius: '20px', background: '#fff', border: '1px solid #e2e8f0', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        <div className="chart-header" style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Bricolage Grotesque', margin: 0 }}>📊 Performance Trends</h4>
        </div>
        <div className="chart-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '20px', background: '#f8fafc', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
            color: '#cbd5e1'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
          </div>
          <h5 style={{ margin: '0 0 8px 0', color: '#0A1E28', fontWeight: '700' }}>No Activity Data</h5>
          <p style={{ margin: 0, fontSize: '13px', maxWidth: '240px' }}>There are no trading activities recorded for this period yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      background: '#ffffff', 
      borderRadius: '32px', 
      border: '1px solid #f1f5f9', 
      position: 'relative',
      boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
      fontFamily: 'DM Sans, sans-serif'
    }}>
      {/* Premium Decorative Gradient */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(200, 240, 50, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

      {/* Header section with refined spacing */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', background: '#0A1E28', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8F032', boxShadow: '0 8px 16px rgba(10,30,40,0.2)' }}>
              <TrendingUp size={20} />
            </div>
            <h4 style={{ fontSize: '22px', fontWeight: '800', color: '#0A1E28', margin: 0, fontFamily: 'Bricolage Grotesque', letterSpacing: '-0.03em' }}>
              Volume Activity
            </h4>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontWeight: '500' }}>
            Tracking processed volume across all active currencies
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            Total Processed
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0A1E28', fontFamily: 'Bricolage Grotesque', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalVolume)}
          </div>
        </div>
      </div>

      {/* Standardized Chart Area */}
      <div style={{ 
        height: '300px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'flex-end', 
        paddingLeft: '70px',
        paddingBottom: '50px'
      }}>
        {/* Subtle Y-Axis Grid */}
        <div style={{ position: 'absolute', inset: '0 0 50px 70px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ 
              width: '100%', 
              borderTop: i === 4 ? '1.5px solid #0A1E28' : '1px solid #f8fafc', 
              position: 'relative' 
            }}>
              <span style={{ 
                position: 'absolute', 
                right: '100%', 
                top: '-9px', 
                paddingRight: '20px', 
                fontSize: '11px', 
                fontWeight: '700', 
                color: '#cbd5e1',
                fontFamily: 'monospace'
              }}>
                {formatCurrency(maxVolume * (1 - i/4))}
              </span>
            </div>
          ))}
        </div>

        {/* Premium Bars */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'flex-end', 
          height: '100%', 
          zIndex: 1,
          paddingInline: '30px'
        }}>
          {safePoints.map((data, idx) => {
            const heightPerc = maxVolume > 0 ? (data.volume / maxVolume) * 100 : 8;
            const isHovered = hoveredIndex === idx;

            return (
              <div 
                key={idx} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', position: 'relative' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar Component */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPerc}%` }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: idx * 0.05 
                  }}
                  style={{
                    width: '64px',
                    borderRadius: '12px 12px 4px 4px',
                    background: isHovered 
                      ? '#C8F032' 
                      : '#0A1E28',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: isHovered ? '0 15px 35px rgba(200, 240, 50, 0.4)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Glass Highlight Overlay */}
                  <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', height: '30%', background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)', borderRadius: '6px' }} />

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 0 }}
                        animate={{ opacity: 1, scale: 1, y: -65 }}
                        exit={{ opacity: 0, scale: 0.8, y: 0 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#0A1E28',
                          color: '#fff',
                          padding: '12px 18px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          fontWeight: '800',
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{data.day} Volume</div>
                        {formatCurrency(data.volume)}
                        <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #0A1E28' }}></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* X-Axis Label */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-40px', 
                  fontSize: '12px', 
                  fontWeight: '800', 
                  color: isHovered ? '#0A1E28' : '#cbd5e1',
                  letterSpacing: '0.02em',
                  transition: 'color 0.3s'
                }}>
                  {data.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refined Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '70px', paddingTop: '32px', borderTop: '1px solid #f8fafc' }}>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#0A1E28' }}></div>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Active Volume</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#C8F032' }}></div>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Selected Context</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '12px', fontWeight: '800', background: '#f0fdf4', padding: '8px 16px', borderRadius: '12px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></div>
          <span>Live Metrics</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ActivityChart;