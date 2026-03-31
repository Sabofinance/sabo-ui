import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { conversionsApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CurrencyConverter from '../../components/CurrencyConverter';
import { extractArray } from '../../lib/api/response';

const ConversionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversions, setConversions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const kycStatus = String((user as any)?.kyc_status || '').toLowerCase();
  const isVerified = kycStatus === 'verified';
  const isPending = kycStatus.includes('pending');

  const kycMessage = useMemo(() => {
    if (isVerified) return '';
    if (isPending) return 'KYC is currently pending review. Conversions unlock once verified.';
    return 'Complete your KYC to access conversions.';
  }, [isPending, isVerified]);

  const loadConversions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await conversionsApi.list();
      if (response.success) setConversions(extractArray(response.data));
      else setError(response.error?.message || 'Failed to load conversions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isVerified) return;
    void loadConversions();
  }, [isVerified, loadConversions]);

  if (!isVerified) {
    return (
      <main className="history-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Conversions</h1>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 14, border: '1px solid #fde68a', background: '#fffbeb', marginBottom: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>KYC required</div>
          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>{kycMessage}</div>
          <button className="export-btn" style={{ marginTop: 12 }} onClick={() => navigate('/dashboard/kyc')}>
            Complete KYC
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Conversions</h1></div>
      
      <div style={{ maxWidth: 500, margin: '0 auto 40px' }}>
        <CurrencyConverter onSuccess={() => void loadConversions()} />
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>From</th><th>To</th><th>Amount</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 16, color: '#6b7280' }}>Loading conversions...</td></tr>
            ) : conversions.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 16, color: '#6b7280' }}>No conversions yet.</td></tr>
            ) : (
              conversions.map((conversion, index) => (
                <tr key={String(conversion.id || index)}>
                  <td>{String(conversion.id || index)}</td>
                  <td>{String((conversion as any).fromCurrency || (conversion as any).from || '-')}</td>
                  <td>{String((conversion as any).toCurrency || (conversion as any).to || '-')}</td>
                  <td>{String((conversion as any).amount || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 600 }}>{error}</div>}
      </div>
    </main>
  );
};

export default ConversionsPage;
