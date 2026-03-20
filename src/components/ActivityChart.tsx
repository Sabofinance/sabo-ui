import React from 'react';
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
  const safePoints = Array.isArray(points) ? points : [];
  const maxVolume = safePoints.length ? Math.max(...safePoints.map((d) => d.volume)) : 0;
  const maxTrades = safePoints.length ? Math.max(...safePoints.map((d) => d.trades)) : 0;

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value}`;
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
      <div className="utility-card chart-card">
        <div className="chart-header">
          <h4>📊 Trading Activity</h4>
        </div>
        <div className="chart-container">
          <p>No activity data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="utility-card chart-card">
      <div className="chart-header">
        <h4>📊 Trading Activity (This Week)</h4>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot volume-dot"></span> Volume
          </span>
          <span className="legend-item">
            <span className="legend-dot trades-dot"></span> Trades
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="chart-container">
        {/* Y-axis labels */}
        <div className="y-axis">
          <span>{formatCurrency(maxVolume)}</span>
          <span>{formatCurrency(maxVolume * 0.75)}</span>
          <span>{formatCurrency(maxVolume * 0.5)}</span>
          <span>{formatCurrency(maxVolume * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="chart-bars">
          {safePoints.map((data, index) => (
            <div key={index} className="bar-group">
              <div className="bars-container">
                <div 
                  className="volume-bar" 
                  style={{ 
                    height: maxVolume > 0 ? `${(data.volume / maxVolume) * 140}px` : '0px',
                  }}
                >
                  <span className="bar-tooltip">{formatCurrency(data.volume)}</span>
                </div>
                <div 
                  className="trades-bar" 
                  style={{ 
                    height: maxTrades > 0 ? `${(data.trades / maxTrades) * 100}px` : '0px',
                  }}
                >
                  <span className="bar-tooltip">{data.trades} trades</span>
                </div>
              </div>
              <span className="bar-label">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Total Trades</span>
          <span className="stat-value">{totalTrades}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Volume</span>
          <span className="stat-value">{formatCurrency(totalVolume)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg. per Trade</span>
          <span className="stat-value">{formatCurrency(avgPerTrade)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Traders</span>
          <span className="stat-value">{activeTraders}</span>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="trend-indicator">
        <span className="trend-up">↑ live</span>
        <span className="trend-text">based on recent data</span>
      </div>
    </div>
  );
};

export default ActivityChart;