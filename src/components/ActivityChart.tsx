import React from 'react';
import '../assets/css/ActivityChart.css';

const ActivityChart: React.FC = () => {
  // Chart data
  const chartData = [
    { day: 'Mon', trades: 8, volume: 2400000 },
    { day: 'Tue', trades: 12, volume: 3200000 },
    { day: 'Wed', trades: 15, volume: 4100000 },
    { day: 'Thu', trades: 10, volume: 2800000 },
    { day: 'Fri', trades: 18, volume: 5200000 },
    { day: 'Sat', trades: 6, volume: 1800000 },
    { day: 'Sun', trades: 4, volume: 1200000 },
  ];

  const maxVolume = Math.max(...chartData.map(d => d.volume));
  const maxTrades = Math.max(...chartData.map(d => d.trades));

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value}`;
  };

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
          {chartData.map((data, index) => (
            <div key={index} className="bar-group">
              <div className="bars-container">
                <div 
                  className="volume-bar" 
                  style={{ 
                    height: `${(data.volume / maxVolume) * 140}px`,
                  }}
                >
                  <span className="bar-tooltip">{formatCurrency(data.volume)}</span>
                </div>
                <div 
                  className="trades-bar" 
                  style={{ 
                    height: `${(data.trades / maxTrades) * 100}px`,
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
          <span className="stat-value">73</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Volume</span>
          <span className="stat-value">₦20.7M</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg. per Trade</span>
          <span className="stat-value">₦283.5K</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Traders</span>
          <span className="stat-value">12</span>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="trend-indicator">
        <span className="trend-up">↑ 23.5%</span>
        <span className="trend-text">higher than last week</span>
      </div>
    </div>
  );
};

export default ActivityChart;