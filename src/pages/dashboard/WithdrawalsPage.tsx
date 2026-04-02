import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { beneficiariesApi, walletsApi, withdrawalsApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import Pagination from '../../components/Pagination';
import '../../assets/css/HistoryPage.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WithdrawalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [withdrawals, setWithdrawals] = useState<Record<string, unknown>[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Record<string, unknown>[]>([]);
  const [wallets, setWallets] = useState<Record<string, unknown>[]>([]);

  const [currency, setCurrency] = useState<'NGN' | 'GBP' | 'USD' | 'CAD'>('NGN');
  const [beneficiaryId, setBeneficiaryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    const [wRes, bRes, walletsRes] = await Promise.all([
      withdrawalsApi.list({ page, limit: 10 }),
      beneficiariesApi.list(),
      walletsApi.list(),
    ]);

    if (wRes.success) {
      setWithdrawals(extractArray(wRes.data));
      const meta = (wRes.data as any)?.meta || (wRes.data as any);
      setTotalPages(meta.totalPages || meta.last_page || 1);
      setCurrentPage(page);
    } else {
      toast.error(wRes.error?.message || 'Failed to load withdrawals');
    }

    if (bRes.success) setBeneficiaries(extractArray(bRes.data));
    else toast.error(bRes.error?.message || 'Failed to load beneficiaries');

    if (walletsRes.success) setWallets(extractArray(walletsRes.data));
    else toast.error(walletsRes.error?.message || 'Failed to load wallets');

    setLoading(false);
  }, []);

  useEffect(() => {
    void load(currentPage);
  }, [load]);

  const reload = async () => {
    const response = await withdrawalsApi.list({ page: currentPage, limit: 10 });
    if (response.success) {
      setWithdrawals(extractArray(response.data));
    } else {
      const msg = response.error?.message || 'Failed to load withdrawals';
      toast.error(msg);
    }
  };

  const kycStatus = String((user as any)?.kyc_status || '').toLowerCase();
  const isVerified = kycStatus === 'verified';
  const pinSet = Boolean((user as any)?.transaction_pin_set);

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => String((b as any).currency || '').toUpperCase() === currency);
  }, [beneficiaries, currency]);

  useEffect(() => {
    // reset selection when currency changes
    if (filteredBeneficiaries.length) setBeneficiaryId(String((filteredBeneficiaries[0] as any).id || ''));
    else setBeneficiaryId('');
  }, [currency, filteredBeneficiaries]);

  const availableBalance = useMemo(() => {
    const w = wallets.find((x) => String((x as any).currency || '').toUpperCase() === currency) as any;
    if (!w) return 0;
    return Number(w.available_balance ?? w.availableBalance ?? w.available ?? w.balance ?? 0) || 0;
  }, [wallets, currency]);

  const submitWithdrawal = async () => {
    setError('');
    if (!isVerified) {
      setError('Withdrawals require verified KYC.');
      return;
    }
    if (!pinSet) {
      toast.error('Transaction PIN required to request withdrawals.');
      navigate('/dashboard/transaction-pin');
      return;
    }
    if (!beneficiaryId) {
      setError('Please select a beneficiary.');
      return;
    }
    const raw = Number(amount.replace(/[^0-9.]/g, '')) || 0;
    if (raw <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (raw > availableBalance) {
      setError(`Amount exceeds available balance (${availableBalance.toFixed(2)} ${currency}).`);
      return;
    }

    setSubmitting(true);
    const res = await withdrawalsApi.request({ beneficiary_id: beneficiaryId, amount: raw.toFixed(2) });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error?.message || 'Failed to request withdrawal.');
      return;
    }
    toast.success('Withdrawal requested successfully.');
    setAmount('');
    await reload();
  };

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdrawals</h1>
          <p className="page-subtitle">Request withdrawals to your saved beneficiaries</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="export-btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              background: '#fff',
              color: '#0A1E28',
              border: '1px solid #e2e8f0'
            }} 
            onClick={() => void load()}
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="export-btn" style={{ background: '#C8F032', color: '#0A1E28' }} onClick={() => navigate('/dashboard/beneficiaries')}>
            Manage beneficiaries
          </button>
        </div>
      </div>

      {!isVerified && (
        <div className="summary-cards" style={{ marginBottom: '1.5rem' }}>
          <div className="summary-card" style={{ flex: 1, borderLeft: '5px solid #f39c12' }}>
            <div className="summary-info">
              <span className="summary-label">KYC required</span>
              <span className="summary-value" style={{ fontSize: 14, color: '#6b7280' }}>
                Withdrawals are only available after KYC verification.
              </span>
              <div style={{ marginTop: 12 }}>
                <button className="export-btn" onClick={() => navigate('/dashboard/kyc')}>
                  Complete KYC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="filters-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
        <div className="filter-group">
          <label>Currency</label>
          <select className="filter-select" value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
            <option value="NGN">NGN</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
            <option value="CAD">CAD</option>
          </select>
          <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
            Available: {new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(availableBalance)} {currency}
          </div>
        </div>

        <div className="filter-group">
          <label>Beneficiary</label>
          <select className="filter-select" value={beneficiaryId} onChange={(e) => setBeneficiaryId(e.target.value)}>
            {filteredBeneficiaries.length === 0 ? (
              <option value="">No beneficiaries for {currency}</option>
            ) : (
              filteredBeneficiaries.map((b: any) => (
                <option key={String(b.id)} value={String(b.id)}>
                  {String(b.bank_name || b.bankName || 'Bank')} · {String(b.account_name || b.accountName || 'Account')} · {String(b.account_number || b.accountNumber || '')}
                </option>
              ))
            )}
          </select>
          {filteredBeneficiaries.length === 0 && (
            <button className="export-btn" style={{ marginTop: 10 }} onClick={() => navigate('/dashboard/beneficiaries')}>
              Add beneficiary
            </button>
          )}
        </div>

        <div className="filter-group">
          <label>Amount</label>
          <input className="filter-select" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          <button className="export-btn" style={{ marginTop: 10 }} disabled={submitting || !isVerified || filteredBeneficiaries.length === 0} onClick={() => void submitWithdrawal()}>
            {submitting ? 'Submitting...' : 'Request withdrawal'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-state" style={{ marginTop: 14, padding: '14px 16px', borderRadius: 14, background: '#ffebee', color: '#c62828' }}>
          {error}
        </div>
      )}

      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>ID</th><th>Currency</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 16, color: '#6b7280' }}>Loading withdrawals...</td></tr>
            ) : withdrawals.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 16, color: '#6b7280' }}>No withdrawals yet.</td></tr>
            ) : (
              withdrawals.map((withdrawal, index) => {
                const id = String((withdrawal as any).id || (withdrawal as any)._id || index);
                const cur = String((withdrawal as any).currency || '-');
                const amt = Number((withdrawal as any).amount || 0);
                const st = String((withdrawal as any).status || '-');
                const dateRaw = String((withdrawal as any).createdAt || (withdrawal as any).date || '');
                return (
                  <tr key={id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/withdrawals/${id}`)}>
                    <td>{id}</td>
                    <td>{cur}</td>
                    <td>{new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amt)}</td>
                    <td>{st}</td>
                    <td>{dateRaw ? new Date(dateRaw).toLocaleString() : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(p) => void load(p)} 
        isLoading={loading} 
      />
    </main>
  );
};

export default WithdrawalsPage;
