import React, { useEffect, useMemo, useState } from 'react';
import { depositsApi } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface DepositModalProps {
  onClose: () => void;
  defaultCurrency?: 'NGN' | 'USD' | 'GBP' | 'CAD';
}

const CURRENCY_OPTIONS: Array<'NGN' | 'USD' | 'GBP' | 'CAD'> = ['NGN', 'USD', 'GBP', 'CAD'];

const DepositModal: React.FC<DepositModalProps> = ({ onClose, defaultCurrency = 'NGN' }) => {
  const toast = useToast();

  const [currency, setCurrency] = useState<DepositModalProps['defaultCurrency']>(defaultCurrency);
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const rawAmount = useMemo(() => {
    const v = parseFloat(amount.replace(/[^0-9.]/g, ''));
    return Number.isFinite(v) ? v : 0;
  }, [amount]);

  const getSymbol = (c: string) => {
    switch (c) {
      case 'NGN':
        return '₦';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'CAD':
        return 'CA$';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rawAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      const res =
        currency === 'NGN'
          ? await depositsApi.initiateNgnDeposit({ amount: rawAmount })
          : await depositsApi.initiateForeignDeposit({ currency, amount: rawAmount });

      if (!res.success) {
        toast.error(res.error?.message || 'Failed to initiate deposit');
        setError(res.error?.message || 'Failed to initiate deposit');
        return;
      }

      setSuccessData(res.data);
      toast.success('Deposit initiated. Complete payment to top up your wallet.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to initiate deposit');
      setError(err?.message || 'Failed to initiate deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentUrl = useMemo(() => {
    const d = successData || {};
    const url =
      d?.paymentUrl ||
      d?.payment_url ||
      d?.url ||
      d?.payment_link ||
      d?.redirectUrl ||
      d?.redirect_url ||
      null;
    return url ? String(url) : null;
  }, [successData]);

  const depositRef = useMemo(() => {
    const d = successData || {};
    const ref =
      d?.reference || d?.ref || d?.id || d?.depositId || d?.paymentId || null;
    return ref ? String(ref) : null;
  }, [successData]);

  if (successData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="sell-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">
            ×
          </button>

          <h2 className="modal-title" style={{ marginTop: 4 }}>
            Deposit initiated
          </h2>
          <p className="modal-subtitle" style={{ marginBottom: 18 }}>
            Send the requested payment to receive your balance.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <div style={{ background: 'rgba(15,23,42,0.04)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                Currency & Amount
              </div>
              <div style={{ marginTop: 6, fontWeight: 900, color: '#0A1E28' }}>
                {getSymbol(String(currency))}{rawAmount} {currency}
              </div>
            </div>

            {depositRef && (
              <div style={{ background: 'rgba(15,23,42,0.04)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                  Reference
                </div>
                <div style={{ marginTop: 6, fontWeight: 900, color: '#0A1E28' }}>{depositRef}</div>
              </div>
            )}

            {paymentUrl && (
              <a
                className="btn-submit-sabo"
                href={paymentUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textAlign: 'center', textDecoration: 'none' }}
              >
                Continue to Payment
              </a>
            )}
          </div>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-submit-sabo" onClick={onClose} style={{ width: 'auto', padding: '14px 18px', background: '#e2e8f0' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sell-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <h2 className="modal-title" style={{ marginTop: 4 }}>
          Deposit Funds
        </h2>
        <p className="modal-subtitle">Choose a wallet currency, enter an amount, and initiate a deposit.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Deposit Currency</label>
            <div className="input-box-wrapper" style={{ padding: 0 }}>
              <select
                value={currency || 'NGN'}
                onChange={(e) => setCurrency(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '14px 15px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#0A1E28',
                  outline: 'none',
                }}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Amount</label>
            <div className="input-box-wrapper">
              <input
                type="text"
                className="clean-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${getSymbol(String(currency))}0.00`}
              />
            </div>
            {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
          </div>

          <button
            type="submit"
            className="btn-submit-sabo"
            disabled={submitting || rawAmount <= 0}
          >
            {submitting ? 'Initiating...' : 'Initiate Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;

