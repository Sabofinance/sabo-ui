import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/css/SellSuccessModal.css';

interface SellSuccessModalProps {
  currency: string;
  amount: number;
  received: number;
  receiveSymbol: string;
  onClose: () => void;
  noOverlay?: boolean;
}

const SellSuccessModal: React.FC<SellSuccessModalProps> = ({
  currency,
  amount,
  received,
  receiveSymbol,
  onClose,
  noOverlay = false,
}) => {
  const content = (
    <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">
        &times;
      </button>

      <div className="success-icon-container">
        <svg viewBox="0 0 24 24" fill="none" stroke="#C8F032" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="success-title">Sale Successful!</h2>

      <p className="success-message">
        You have successfully sold{' '}
        <strong>{currency} {amount.toLocaleString('en-GB')}</strong><br />
        and {receiveSymbol}{received.toFixed(2)} is on its way to your wallet.
      </p>

      <div className="success-actions">
        <NavLink
          to="/dashboard/active-sabits"
          className="btn-market"
          onClick={onClose}
        >
          BACK TO MARKETPLACE
        </NavLink>
      </div>
    </div>
  );

  // If noOverlay is true, we just return the content. 
  // This prevents the "Double Container" effect if you are already inside another modal wrapper.
  if (noOverlay) return content;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {content}
    </div>
  );
};

export default SellSuccessModal;