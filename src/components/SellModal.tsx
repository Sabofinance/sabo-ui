import React, { useState } from 'react';
import SellSuccessModal from './SellSuccessModal'; // adjust path as needed
import '../assets/css/SellModal.css';

interface SellModalProps {
  balance: number;
  currency: string;
  symbol: string;
  // When selling NGN, this controls which foreign currency you want to buy.
  // (When selling a non-NGN wallet currency, the receive currency is always NGN.)
  targetCurrency?: string;
  onClose: () => void;
  onSubmit: (
    amountSent: number,
    rate: number,
    amountReceived: number,
    receiveCurrency: string,
  ) => Promise<void>;
}

const SellModal: React.FC<SellModalProps> = ({
  balance,
  currency,
  symbol,
  targetCurrency = 'GBP',
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    amount: number;
    received: number;
    receiveSymbol: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const FEE_PERCENT = 0.01;
  const isSellingNaira = currency === 'NGN';

  const getCurrencySymbol = (c: string): string => {
    switch (c) {
      case 'GBP':
        return '£';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'NGN':
        return '₦';
      default:
        return '';
    }
  };

  const receiveCurrency = isSellingNaira ? targetCurrency : 'NGN';
  const receiveSymbol = getCurrencySymbol(receiveCurrency);

  const rawAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
  const rawRate = parseFloat(rate.replace(/[^0-9.]/g, '')) || 0;

  const subtotal = isSellingNaira
    ? rawRate > 0 ? rawAmount / rawRate : 0
    : rawAmount * rawRate;

  const feeAmount = subtotal * FEE_PERCENT;
  const finalReceive = subtotal - feeAmount;

  const formatDisplay = (val: string, curSymbol: string) => {
    if (!val) return '';
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    const formattedInt = new Intl.NumberFormat('en-GB').format(parseFloat(parts[0]) || 0);
    return `${curSymbol}${formattedInt}${parts.length > 1 ? '.' + parts[1] : ''}`;
  };

  const handleInput = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const dots = value.split('.').length - 1;
    if (dots <= 1) setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (rawAmount > 0 && rawRate > 0 && rawAmount <= balance) {
      setSubmitting(true);
      try {
        // Wait for API create to succeed before showing the success screen.
        await onSubmit(rawAmount, rawRate, finalReceive, receiveCurrency);

        // Store data for success screen
        setSuccessData({
          amount: rawAmount,
          received: finalReceive,
          receiveSymbol,
        });

        setShowSuccess(true);
      } catch (err: any) {
        setSubmitError(
          err?.message || (typeof err === 'string' ? err : '') || 'Failed to create listing. Please try again.',
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSuccessClose = () => {
    // Close the entire modal (parent controls visibility)
    onClose();
  };

  // If success modal should be shown, render it directly (with its own overlay)
  if (showSuccess && successData) {
    return (
      <SellSuccessModal
        currency={currency}
        amount={successData.amount}
        received={successData.received}
        receiveSymbol={successData.receiveSymbol}
        onClose={handleSuccessClose}
        // noOverlay is intentionally omitted so the success modal has its own overlay
      />
    );
  }

  // Otherwise render the sell modal with its overlay and content
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sell-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose}>×</button>

        <header className="modal-header">
          <h2 className="modal-title">Sell {currency}</h2>
          <p className="modal-subtitle">
            Balance: {symbol}{new Intl.NumberFormat('en-GB').format(balance)}
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Amount to Sell */}
          <div className="form-group">
            <label className="input-label">Amount to Sell</label>
            <div className="input-box-wrapper">
              <input
                type="text"
                className="clean-input"
                value={formatDisplay(amount, symbol)}
                onChange={handleInput(setAmount)}
                placeholder={`${symbol}0.00`}
              />
            </div>
            {rawAmount > balance && <span className="error-text">Insufficient balance</span>}
          </div>

          {/* Exchange Rate */}
          <div className="form-group">
            <label className="input-label">
              Exchange Rate (₦ per {receiveSymbol || '1'})
            </label>
            <div className="input-box-wrapper">
              <input
                type="text"
                className="clean-input"
                value={formatDisplay(rate, '₦')}
                onChange={handleInput(setRate)}
                placeholder="₦0.00"
              />
            </div>
          </div>

          {/* Total You Receive */}
          <div className="form-group">
            <label className="input-label">Total You Receive ({receiveCurrency})</label>
            <div style={{ padding: '8px 0' }}>
              <span style={{
                fontSize: '1.8rem',
                fontWeight: '800',
                color: '#0A1E28',
                letterSpacing: '-0.5px'
              }}>
                {receiveSymbol}{new Intl.NumberFormat('en-GB', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(finalReceive || 0)}
              </span>
            </div>
          </div>

          {/* Fee Info */}
          <div className="fee-info">
            Sabo Fee (1%):
            <span className="fee-amt">
              {receiveSymbol}{new Intl.NumberFormat('en-GB').format(feeAmount)}
            </span>
          </div>

          {submitError && <div className="error-text" style={{ marginTop: '10px' }}>{submitError}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-submit-sabo"
            disabled={
              submitting ||
              !amount ||
              !rate ||
              rawAmount <= 0 ||
              rawAmount > balance ||
              rawRate <= 0
            }
          >
            SELL {currency}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellModal;