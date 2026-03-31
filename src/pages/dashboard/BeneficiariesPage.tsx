import React, { useEffect, useMemo, useState } from 'react';
import { beneficiariesApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BeneficiariesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currency, setCurrency] = useState<'NGN' | 'GBP' | 'USD' | 'CAD'>('NGN');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [iban, setIban] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBeneficiaries = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }
    try {
      const response = await beneficiariesApi.list();
      if (response.success && Array.isArray(response.data)) {
        setBeneficiaries(response.data);
      } else if (!response.success) {
        const msg = response.error?.message || 'Failed to load beneficiaries';
        if (showLoading) {
          setError(msg);
        } else {
          toast.error(msg);
        }
      }
    } catch (err: any) {
      const msg = 'An unexpected error occurred while loading beneficiaries';
      if (showLoading) {
        setError(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => { void loadBeneficiaries(true); }, []);

  const handleAdd = async () => {
    const kycStatus = String((user as any)?.kyc_status || '').toLowerCase();
    if (kycStatus !== 'verified') {
      toast.error('You need verified KYC to add beneficiaries.');
      navigate('/dashboard/kyc');
      return;
    }

    if (!bankName || !accountName || !accountNumber) {
      toast.error('Please fill bank name, account name, and account number.');
      return;
    }

    const payload: Record<string, unknown> = {
      currency,
      bank_name: bankName,
      account_name: accountName,
      account_number: accountNumber,
    };
    if (currency === 'GBP' && sortCode) payload.sort_code = sortCode;
    if ((currency === 'GBP' || currency === 'USD' || currency === 'CAD') && iban) payload.iban = iban;

    setSubmitting(true);
    const res = await beneficiariesApi.create(payload);
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error?.message || 'Failed to create beneficiary');
      return;
    }

    toast.success('Beneficiary added.');
    setBankName('');
    setAccountName('');
    setAccountNumber('');
    setSortCode('');
    setIban('');
    await loadBeneficiaries(false);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    const ok = window.confirm('Delete this beneficiary?');
    if (!ok) return;
    const res = await beneficiariesApi.remove(id);
    if (!res.success) toast.error(res.error?.message || 'Failed to delete beneficiary');
    else toast.success('Beneficiary deleted.');
    await loadBeneficiaries(false);
  };

  const byCurrency = useMemo(() => {
    const map: Record<string, Record<string, unknown>[]> = { NGN: [], GBP: [], USD: [], CAD: [] };
    for (const b of beneficiaries) {
      const c = String((b as any).currency || 'NGN').toUpperCase();
      if (!map[c]) map[c] = [];
      map[c].push(b);
    }
    return map;
  }, [beneficiaries]);

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Beneficiaries</h1>
          <p className="page-subtitle">Manage saved bank recipients for withdrawals</p>
        </div>
        <button className="export-btn" onClick={() => navigate('/dashboard/withdrawals')}>
          Back to withdrawals
        </button>
      </div>
      {error && (
        <div style={{ padding: '16px', margin: '16px 0', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b' }}>
          {error}
        </div>
      )}
      {loading && (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
          Loading beneficiaries...
        </div>
      )}
      {!loading && (
      <>
      <div className="filters-section">
        <div className="filter-group">
          <label>Currency</label>
          <select className="filter-select" value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
            <option value="NGN">NGN</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
        <div className="filter-group"><label>Bank Name</label><input className="filter-select" value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>
        <div className="filter-group"><label>Account Name</label><input className="filter-select" value={accountName} onChange={(e) => setAccountName(e.target.value)} /></div>
        <div className="filter-group"><label>Account Number</label><input className="filter-select" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /></div>
        {currency === 'GBP' && (
          <div className="filter-group"><label>Sort Code (GBP only)</label><input className="filter-select" value={sortCode} onChange={(e) => setSortCode(e.target.value)} /></div>
        )}
        {(currency === 'GBP' || currency === 'USD' || currency === 'CAD') && (
          <div className="filter-group"><label>IBAN (GBP/USD/CAD)</label><input className="filter-select" value={iban} onChange={(e) => setIban(e.target.value)} /></div>
        )}
        <button className="export-btn" onClick={() => void handleAdd()} disabled={submitting}>
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>Currency</th><th>Bank</th><th>Account Name</th><th>Account Number</th><th>Sort Code</th><th>IBAN</th><th>Action</th></tr></thead>
          <tbody>
            {beneficiaries.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 16, color: '#6b7280' }}>No beneficiaries yet.</td></tr>
            ) : (
              Object.entries(byCurrency).flatMap(([cur, list]) =>
                list.map((beneficiary: any, index: number) => (
                  <tr key={String(beneficiary.id || index)}>
                    <td>{cur}</td>
                    <td>{String(beneficiary.bank_name || beneficiary.bankName || '-')}</td>
                    <td>{String(beneficiary.account_name || beneficiary.accountName || '-')}</td>
                    <td>{String(beneficiary.account_number || beneficiary.accountNumber || '-')}</td>
                    <td>{String(beneficiary.sort_code || beneficiary.sortCode || '-')}</td>
                    <td>{String(beneficiary.iban || '-')}</td>
                    <td>
                      <button className="page-number" onClick={() => void handleDelete(String(beneficiary.id || ''))}>Delete</button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
      </>
      )}
    </main>
  );
};

export default BeneficiariesPage;
