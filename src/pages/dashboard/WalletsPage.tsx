import React, { useEffect, useState } from 'react';
import { walletsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

type WalletItem = Record<string, unknown>;

const WalletsPage: React.FC = () => {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const response = await walletsApi.list();
      if (!response.success || !Array.isArray(response.data)) return;
      setWallets(response.data);
      if (response.data[0]?.id) setSelectedWalletId(String(response.data[0].id));
    };
    void load();
  }, []);

  const selected = wallets.find((wallet) => String(wallet.id || '') === selectedWalletId) || null;

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Wallets</h1>
          <p className="page-subtitle">Wallet list and wallet details</p>
        </div>
      </div>
      <div className="filters-section">
        <div className="filter-group">
          <label>Select Wallet</label>
          <select className="filter-select" value={selectedWalletId} onChange={(e) => setSelectedWalletId(e.target.value)}>
            {wallets.map((wallet) => (
              <option key={String(wallet.id || wallet.currency)} value={String(wallet.id || '')}>
                {String(wallet.currency || 'Wallet')} - {String(wallet.balance || 0)}
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => (
              <tr key={String(wallet.id || wallet.currency)}>
                <td>{String(wallet.currency || '')}</td>
                <td>{String(wallet.balance || 0)}</td>
                <td>{String(wallet.status || 'active')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="summary-cards" style={{ marginTop: '1rem' }}>
          <div className="summary-card">
            <div className="summary-info">
              <span className="summary-label">Wallet Details</span>
              <span className="summary-value">
                {String(selected.currency || '')} • {String(selected.accountNumber || 'N/A')}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default WalletsPage;
