import React, { useEffect, useState } from 'react';
import { kycApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const KycPage: React.FC = () => {
  const [status, setStatus] = useState('pending');
  const [documentNumber, setDocumentNumber] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadStatus = async () => {
      const response = await kycApi.getStatus();
      if (response.success && response.data && typeof response.data === 'object') {
        setStatus(String((response.data as Record<string, unknown>).status || 'pending'));
      }
    };
    void loadStatus();
  }, []);

  const handleSubmit = async () => {
    const response = await kycApi.submit({ documentNumber });
    setMessage(response.success ? 'KYC submitted successfully.' : (response.error?.message || 'Failed to submit KYC.'));
  };

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">KYC</h1></div>
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-info">
            <span className="summary-label">Current Status</span>
            <span className="summary-value">{status}</span>
          </div>
        </div>
      </div>
      <div className="filters-section">
        <div className="filter-group">
          <label>Document Number</label>
          <input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
        </div>
        <button className="export-btn" onClick={handleSubmit}>Submit KYC</button>
      </div>
      {message && <p>{message}</p>}
    </main>
  );
};

export default KycPage;
