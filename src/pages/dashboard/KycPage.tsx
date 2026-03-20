import React, { useEffect, useState } from 'react';
import { kycApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import '../../assets/css/HistoryPage.css';

const KycPage: React.FC = () => {
  const [status, setStatus] = useState('pending');
  const [documentType, setDocumentType] = useState('passport');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { fetchNotifications } = useNotifications();

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
    if (!documentFile || !selfieFile) {
      toast.error('Please upload both document and selfie.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('document', documentFile);
    formData.append('selfie', selfieFile);
    const response = await kycApi.upload(formData);
    setLoading(false);
    if (response.success) {
      toast.info('Your KYC documents have been successfully uploaded and are now pending review.', 'KYC Submitted');
      setStatus('pending');
      fetchNotifications();
    } else {
      toast.error('Failed to submit KYC. Please try again.');
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
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Please upload your government-issued ID and a selfie for verification.</p>
          <div className="filter-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label>Document Type</label>
            <select className="filter-select" value={documentType} onChange={e => setDocumentType(e.target.value)}>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="driver_license">Driver's License</option>
            </select>
          </div>
          <div className="filter-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label>Upload Document</label>
            <input type="file" accept="image/*,application/pdf" onChange={e => setDocumentFile(e.target.files?.[0] || null)} />
          </div>
          <div className="filter-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label>Upload Selfie</label>
            <input type="file" accept="image/*" onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
          </div>
          <button className="export-btn" onClick={handleSubmit} style={{ width: '200px' }} disabled={loading}>{loading ? 'Submitting...' : 'Submit for Review'}</button>
        </div>
      )}
    </main>
  );
};

export default KycPage;
