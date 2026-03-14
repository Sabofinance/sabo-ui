import React, { useState } from 'react';
import SellSuccessModal from './SellSuccessModal'; // adjust path as needed
import '../assets/css/SellModal.css';

interface SellModalProps {
  balance: number;
  currency: string;
  symbol: string;
  onClose: () => void;
  onSubmit: (amount: number, rate: number) => void;
  onSuccess?: (amount: number, received: number, receiveSymbol: string) => void;
}

const SellModal: React.FC<SellModalProps> = ({
  balance,
  currency,
  symbol,
  onClose,
  onSubmit,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    amount: number;
    received: number;
    receiveSymbol: string;
  } | null>(null);

  const FEE_PERCENT = 0.01;
  const isSellingNaira = currency === 'NGN';
  const receiveSymbol = isSellingNaira ? '£' : '₦';
  const receiveCurrency = isSellingNaira ? 'GBP' : 'NGN';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rawAmount > 0 && rawRate > 0 && rawAmount <= balance) {
      // Store data for success screen
      setSuccessData({
        amount: rawAmount,
        received: finalReceive,
        receiveSymbol,
      });

      // Show success modal (which will replace the sell modal entirely)
      setShowSuccess(true);

      // Notify parent
      onSubmit(rawAmount, rawRate);
      if (onSuccess) {
        onSuccess(rawAmount, finalReceive, receiveSymbol);
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
            <label className="input-label">Exchange Rate (₦ per £1)</label>
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

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-submit-sabo"
            disabled={!amount || !rate || rawAmount <= 0 || rawAmount > balance || rawRate <= 0}
          >
            SELL {currency}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellModal;