import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import { Banknote, Edit3, PlusCircle, RefreshCw } from 'lucide-react';

interface CompanyRateRecord {
  currency: string;
  rate_ngn: number;
}

const AdminCompanyRatesPage: React.FC = () => {
  const [rates, setRates] = useState<CompanyRateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currency, setCurrency] = useState('');
  const [rate, setRate] = useState('');
  const [editing, setEditing] = useState(false);
//   const [activeCurrency, setActiveCurrency] = useState('');
  const [error, setError] = useState('');

  const normalizeRecord = (item: any): CompanyRateRecord | null => {
    const currencyValue = String(item?.currency || item?.code || '').toUpperCase().trim();
    const rawRate = item?.rate ?? item?.rate_ngn ?? item?.rateNgn;
    const rateValue = Number(rawRate);

    if (!currencyValue || Number.isNaN(rateValue)) return null;
    return { currency: currencyValue, rate_ngn: rateValue };
  };

  const loadRates = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await adminApi.listCompanyRates();
      if (res.success) {
        const data = res.data as any;
        const list = (Array.isArray(data?.rates) ? data.rates : extractArray(data)) as any[];
        const normalized = list
          .map(normalizeRecord)
          .filter((item:any): item is CompanyRateRecord => item !== null);
        setRates(normalized);
      } else {
        const message = res.error?.message || 'Unable to load company rates.';
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRates();
  }, []);

  const resetForm = () => {
    setCurrency('');
    setRate('');
    setEditing(false);
    // setActiveCurrency('');
    setError('');
  };

  const handleEdit = async (currencyCode: string) => {
    setFormLoading(true);
    setError('');

    try {
      const res = await adminApi.getCompanyRate(currencyCode);
      if (res.success && res.data) {
        const record = normalizeRecord(res.data) || { currency: currencyCode, rate_ngn: 0 };
        setCurrency(record.currency);
        setRate(String(record.rate_ngn));
        setEditing(true);
        // setActiveCurrency(currencyCode);
      } else {
        const message = res.error?.message || 'Could not fetch company rate.';
        setError(message);
        toast.error(message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedCurrency = currency.trim().toUpperCase();
    const parsedRate = Number(rate);

    if (!normalizedCurrency) {
      setError('Currency code is required.');
      return;
    }
    if (!normalizedCurrency.match(/^[A-Z]{2,5}$/)) {
      setError('Use a valid currency code, e.g. GBP or USD.');
      return;
    }
    if (Number.isNaN(parsedRate) || parsedRate <= 0) {
      setError('Rate must be a positive number.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await adminApi.saveCompanyRate({
        currency: normalizedCurrency,
        rate_ngn: String(parsedRate),
      });

      if (res.success) {
        toast.success(editing ? 'Rate updated successfully' : 'Rate created successfully');
        resetForm();
        void loadRates();
      } else {
        const message = res.error?.message || 'Unable to save company rate.';
        setError(message);
        toast.error(message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const formTitle = editing ? 'Edit Company Rate' : 'Add Company Rate';

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: '#0A1E28', padding: '10px', borderRadius: '12px', color: '#C8F032' }}>
              <Banknote size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', fontFamily: 'Bricolage Grotesque', color: '#0A1E28' }}>Company Rates</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px', fontWeight: '500' }}>Manage company rate mappings by currency and update rates used across the platform.</p>
        </div>

        <button
          type="button"
          onClick={() => void loadRates()}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', marginBottom: '32px' }}>
        <section style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0A1E28' }}>Rates Table</h2>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>View all configured company rates in NGN.</p>
            </div>
            <span style={{ color: '#64748b', fontSize: '13px' }}>{rates.length} rate{rates.length === 1 ? '' : 's'}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '18px 20px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Currency</th>
                  <th style={{ padding: '18px 20px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Rate (NGN)</th>
                  <th style={{ padding: '18px 20px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '44px', textAlign: 'center', color: '#64748b' }}>Loading company rates...</td>
                  </tr>
                ) : rates.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '44px', textAlign: 'center', color: '#64748b' }}>No company rates configured yet.</td>
                  </tr>
                ) : (
                  rates.map((item) => (
                    <tr key={item.currency} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '18px 20px', fontWeight: '700', color: '#0A1E28' }}>{item.currency}</td>
                      <td style={{ padding: '18px 20px', color: '#0A1E28' }}>₦{item.rate_ngn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => void handleEdit(item.currency)}
                          disabled={formLoading}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer' }}
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '14px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusCircle size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0A1E28' }}>{formTitle}</h2>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>Create or update a company rate entry for a currency.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '18px' }}>
              <label style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#475569' }}>
                Currency code
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="e.g. GBP"
                  disabled={formLoading}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#475569' }}>
                Rate (NGN)
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. 1300"
                  disabled={formLoading}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                />
              </label>

              {error && (
                <div style={{ color: '#dc2626', fontSize: '13px', lineHeight: 1.5 }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{ padding: '14px 24px', borderRadius: '14px', border: 'none', background: '#0A1E28', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editing ? 'Update Rate' : 'Create Rate'}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={formLoading}
                    style={{ padding: '14px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#0A1E28', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>
      </div>

      {error && !loading && !formLoading && (
        <div style={{ marginTop: '8px', color: '#ef4444', fontSize: '14px' }}>{error}</div>
      )}
    </main>
  );
};

export default AdminCompanyRatesPage;
