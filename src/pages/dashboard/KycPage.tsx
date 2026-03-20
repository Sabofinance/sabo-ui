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
    if (!documentNumber.trim()) {
      setMessage('Please enter a document number.');
      return;
    }
    const response = await kycApi.submit({ documentNumber });
    if (response.success) {
      setMessage('KYC submitted successfully. Our team will review it shortly.');
      setStatus('pending');
    } else {
      const errorMsg = response.error?.message || (typeof response.error === 'string' ? response.error : 'Failed to submit KYC.');
      setMessage(errorMsg);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'verified': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#666';
    }
  };

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Identity Verification (KYC)</h1></div>
      
      <div className="summary-cards">
        <div className="summary-card" style={{ borderLeft: `5px solid ${getStatusColor(status)}` }}>
          <div className="summary-info">
            <span className="summary-label">Current Verification Status</span>
            <span className="summary-value" style={{ color: getStatusColor(status), textTransform: 'uppercase' }}>{status}</span>
          </div>
        </div>
      </div>

      {status !== 'verified' && (
        <div className="filters-section" style={{ display: 'block', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Submit Documents</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Please provide your government-issued ID number to verify your account.</p>
          <div className="filter-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label>National ID / Passport / Driver's License Number</label>
            <input 
              className="filter-select"
              style={{ width: '100%', padding: '0.8rem' }}
              placeholder="e.g. A12345678"
              value={documentNumber} 
              onChange={(e) => setDocumentNumber(e.target.value)} 
            />
          </div>
          <button className="export-btn" onClick={handleSubmit} style={{ width: '200px' }}>Submit for Review</button>
        </div>
      )}

      {message && (
        <div className={`notification ${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: message.includes('successfully') ? '#e8f5e9' : '#ffebee', color: message.includes('successfully') ? '#2e7d32' : '#c62828' }}>
          {message}
        </div>
      )}
    </main>
  );
};

export default KycPage;
