import React, { useEffect, useState } from 'react';
import { ratesApi, walletsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

type WalletItem = Record<string, unknown>;

const WalletsPage: React.FC = () => {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rateToNGN, setRateToNGN] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await walletsApi.list();
        if (response.success && Array.isArray(response.data)) {
          setWallets(response.data);
          if (response.data.length > 0) {
            setSelectedWalletId(String(response.data[0].id || response.data[0].currency));
          }

          // Fetch FX rates to convert each wallet currency into NGN (no hardcoded FX rates).
          const currencySet = new Set(
            response.data
              .map((w) => String((w as Record<string, unknown>).currency || 'NGN'))
              .filter((c) => c && c !== 'NGN'),
          );
          const currencies = Array.from(currencySet);

          if (currencies.length) {
            const results = await Promise.all(
              currencies.map(async (c) => {
                // ratesApi.getByPair(base, quote). Existing UI treats (NGN, GBP) as "NGN per 1 GBP".
                const res = await ratesApi.getByPair('NGN', c);
                if (!res.success) return [c, 0] as const;
                const d = res.data as any;
                const v = Number(d?.rate ?? d?.value ?? 0);
                return [c, v] as const;
              }),
            );

            const nextRateToNGN: Record<string, number> = {};
            for (const [c, v] of results) nextRateToNGN[c] = v;
            setRateToNGN(nextRateToNGN);
          } else {
            setRateToNGN({});
          }
        } else if (!response.success) {
          setError(response.error?.message || 'Failed to load wallets');
        }
      } catch (err: any) {
        setError('An unexpected error occurred while loading wallets');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const selected = wallets.find((wallet) => String(wallet.id || wallet.currency) === selectedWalletId) || null;

  const totalBalanceInNGN = wallets.reduce((sum, w) => {
    const balance = Number(w.balance || 0);
    const currency = String(w.currency || 'NGN');
    if (currency === 'NGN') return sum + balance;
    const rate = rateToNGN[currency];
    return sum + balance * (Number.isFinite(rate) && rate > 0 ? rate : 0);
  }, 0);

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active': return '#2ecc71';
      case 'frozen': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#666';
    }
  };

  if (loading) return <div className="loading-state" style={{ padding: '4rem', textAlign: 'center' }}>Loading wallets...</div>;
  if (error) return <div className="error-state" style={{ padding: '4rem', textAlign: 'center', color: '#e74c3c' }}>{error}</div>;

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Wallets</h1>
          <p className="page-subtitle">Manage your currency balances and view account details</p>
        </div>
        <button className="export-btn" style={{ background: '#C8F032', color: '#0A1E28' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New Wallet
        </button>
      </div>

      <div className="summary-cards" style={{ marginBottom: '2rem' }}>
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Total Portfolio Value (Estimated NGN)</span>
            <span className="summary-value" style={{ fontSize: '2rem' }}>₦{new Intl.NumberFormat().format(totalBalanceInNGN)}</span>
            
            <div className="balance-distribution-chart" style={{ display: 'flex', height: '12px', width: '100%', background: '#eee', borderRadius: '6px', overflow: 'hidden', marginTop: '1.5rem' }}>
              {wallets.map((w, idx) => {
                const balance = Number(w.balance || 0);
                const currency = String(w.currency || 'NGN');
                    const valueInNGN =
                      currency === 'NGN'
                        ? balance
                        : balance * (Number.isFinite(rateToNGN[currency]) && (rateToNGN[currency] ?? 0) > 0 ? rateToNGN[currency] : 0);
                const percentage = totalBalanceInNGN > 0 ? (valueInNGN / totalBalanceInNGN) * 100 : 0;
                const colors = ['#C8F032', '#32D4F0', '#F032D4', '#F09E32'];
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: colors[idx % colors.length],
                      transition: 'width 0.3s ease'
                    }} 
                    title={`${currency}: ${balance}`}
                  />
                );
              })}
            </div>
            <div className="chart-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '1rem', fontSize: '12px' }}>
              {wallets.map((w, idx) => {
                const colors = ['#C8F032', '#32D4F0', '#F032D4', '#F09E32'];
                return (
                  <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }}></span>
                    {String(w.currency)} ({new Intl.NumberFormat().format(Number(w.balance || 0))})
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Select Wallet for Details</label>
          <select className="filter-select" value={selectedWalletId} onChange={(e) => setSelectedWalletId(e.target.value)}>
            {wallets.map((wallet) => (
              <option key={String(wallet.id || wallet.currency)} value={String(wallet.id || wallet.currency)}>
                {String(wallet.currency || 'Wallet')} - {new Intl.NumberFormat().format(Number(wallet.balance || 0))}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Balance</th>
              <th>Account Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => (
              <tr 
                key={String(wallet.id || wallet.currency)}
                className={selectedWalletId === String(wallet.id || wallet.currency) ? 'selected-row' : ''}
                onClick={() => setSelectedWalletId(String(wallet.id || wallet.currency))}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="currency-icon">{String(wallet.symbol || '₦')}</span>
                    {String(wallet.currency || '')}
                  </div>
                </td>
                <td><strong>{new Intl.NumberFormat().format(Number(wallet.balance || 0))}</strong></td>
                <td>{String(wallet.accountNumber || '---')}</td>
                <td>
                  <span className={`status-badge ${(wallet.status || 'active').toString().toLowerCase()}`}>
                    {String(wallet.status || 'active')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selected && (
        <div className="summary-cards" style={{ marginTop: '2rem' }}>
          <div className="summary-card" style={{ border: '1px solid #C8F032' }}>
            <div className="summary-info">
              <span className="summary-label">{String(selected.currency)} Wallet Details</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Account Name</p>
                  <p style={{ fontWeight: '600', margin: '5px 0 0 0' }}>{String(selected.accountName || '---')}</p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Account Number</p>
                  <p style={{ fontWeight: '600', margin: '5px 0 0 0' }}>{String(selected.accountNumber || '---')}</p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Bank Name</p>
                  <p style={{ fontWeight: '600', margin: '5px 0 0 0' }}>{String(selected.bank || 'Sabo Bank')}</p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Status</p>
                  <p style={{ fontWeight: '600', margin: '5px 0 0 0', color: '#2ecc71' }}>{String(selected.status || 'Active')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default WalletsPage;
