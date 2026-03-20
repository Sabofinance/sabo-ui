import React from 'react';
import { useToast } from '../context/ToastContext';
import '../assets/css/Toaster.css';

const Toaster: React.FC = () => {
  const { toasts, remove } = useToast();

  return (
    <div className="toaster" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <div className="toast-header">
            <div className="toast-title">
              {t.title ? t.title : t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Info'}
            </div>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Dismiss toast" type="button">
              ×
            </button>
          </div>
          <div className="toast-message">{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Toaster;

