import React, { useEffect, useState } from 'react';
import { kycApi } from '../../lib/api';
import { toast } from 'react-toastify';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/KycPage.css';

/* ─── Icons ─────────────────────────────────────────────────── */
const ShieldCheckIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const ClockIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertCircleIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const UserCheckIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

const PassportIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="18" height="20" rx="2" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 21v-1a5 5 0 0 1 10 0v1" />
  </svg>
);

const IdCardIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="8" cy="12" r="2.5" />
    <path d="M14 10h4M14 14h4" />
  </svg>
);

const CarIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3v-5l2-5h14l2 5v5h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="16.5" cy="17.5" r="2.5" />
    <path d="M5 12h14" />
  </svg>
);

const UploadIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CameraIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const CheckCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const InfoIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const LightbulbIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const ArrowRightIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── Types ──────────────────────────────────────────────────── */
type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
type DocType = 'passport' | 'national_id' | 'driver_license';

const DOC_OPTIONS: { value: DocType; label: string; desc: string; Icon: React.FC<{ size?: number }> }[] = [
  { value: 'passport',       label: 'Passport',        desc: 'International travel document', Icon: PassportIcon },
  { value: 'national_id',    label: 'National ID',     desc: 'Government-issued ID card',      Icon: IdCardIcon },
  { value: 'driver_license', label: "Driver's License", desc: 'Valid driving licence',          Icon: CarIcon },
];

/* ─── Helpers ────────────────────────────────────────────────── */
const normaliseStatus = (raw: unknown): KycStatus => {
  const s = String(raw || '').toLowerCase();
  if (s === 'verified') return 'verified';
  if (s === 'pending')  return 'pending';
  if (s === 'rejected') return 'rejected';
  return 'unverified';
};

/* ─── Sub-components ─────────────────────────────────────────── */

function StatusBanner({ status }: { status: KycStatus }) {
  const cfg: Record<KycStatus, { title: string; desc: string; Icon: React.FC<{ size?: number }> }> = {
    verified:   { title: 'Identity Verified',           desc: 'Your account is fully verified. You have access to all platform features.', Icon: ShieldCheckIcon },
    pending:    { title: 'Verification Under Review',   desc: 'Your documents are being reviewed by our team. This usually takes 1–2 business days.', Icon: ClockIcon },
    rejected:   { title: 'Verification Unsuccessful',   desc: 'We were unable to verify your identity. Please review the feedback and resubmit.', Icon: AlertCircleIcon },
    unverified: { title: 'Identity Not Yet Verified',   desc: 'Complete identity verification to unlock full platform access and increase your limits.', Icon: UserCheckIcon },
  };
  const { title, desc, Icon } = cfg[status];

  return (
    <div className={`kyc-status-banner ${status}`}>
      <div className={`status-icon-wrap ${status}`}>
        <Icon size={26} />
      </div>
      <div className="status-banner-info">
        <div className="status-banner-title">{title}</div>
        <div className="status-banner-desc">{desc}</div>
      </div>
      <span className={`status-pill ${status}`}>{status}</span>
    </div>
  );
}

function VerifiedState() {
  return (
    <div className="kyc-verified-card">
      <div className="kyc-verified-shield">
        <ShieldCheckIcon size={52} />
      </div>
      <div className="kyc-verified-title">You're Fully Verified</div>
      <div className="kyc-verified-subtitle">
        Your identity has been successfully confirmed. Your account now has full access to all trading, deposit, and withdrawal features.
      </div>
      <div className="kyc-verified-details">
        <div className="kyc-verified-detail-item">
          <CheckCircleIcon size={15} />
          Identity Confirmed
        </div>
        <div className="kyc-verified-detail-item">
          <CheckCircleIcon size={15} />
          Full Trading Access
        </div>
        <div className="kyc-verified-detail-item">
          <CheckCircleIcon size={15} />
          Higher Limits Unlocked
        </div>
      </div>
    </div>
  );
}

function PendingState() {
  return (
    <div className="kyc-pending-card">
      <div className="kyc-pending-icon">
        <ClockIcon size={52} />
      </div>
      <div className="kyc-pending-title">Documents Submitted</div>
      <div className="kyc-pending-subtitle">
        Your verification is in progress. Our compliance team will review your documents and update your status within 1–2 business days.
      </div>
      <div className="kyc-pending-steps">
        <div className="kyc-pending-step">
          <div className="kyc-pending-step-dot" />
          <div className="kyc-pending-step-text">
            Documents uploaded
            <span>Received and securely stored</span>
          </div>
        </div>
        <div className="kyc-pending-step">
          <div className="kyc-pending-step-dot active" />
          <div className="kyc-pending-step-text">
            Under review
            <span>Compliance team is verifying your identity</span>
          </div>
        </div>
        <div className="kyc-pending-step">
          <div className="kyc-pending-step-dot" style={{ background: '#E5E7EB' }} />
          <div className="kyc-pending-step-text" style={{ color: '#9CA3AF' }}>
            Verification complete
            <span>You'll be notified by email</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectedState({ onResubmit }: { onResubmit: () => void }) {
  return (
    <div className="kyc-rejected-card">
      <div className="kyc-rejected-top">
        <div className="kyc-rejected-icon">
          <AlertCircleIcon size={32} />
        </div>
        <div>
          <div className="kyc-rejected-text-title">Verification Failed</div>
          <div className="kyc-rejected-text-desc">
            Your submission could not be approved. Please address the issues below and resubmit your documents.
          </div>
        </div>
      </div>

      <div className="kyc-rejected-reasons">
        <div className="kyc-rejected-reasons-title">Common Reasons for Rejection</div>
        <div className="kyc-rejected-reason-item">Document image was blurry or partially cut off</div>
        <div className="kyc-rejected-reason-item">Expired or invalid identification document</div>
        <div className="kyc-rejected-reason-item">Selfie did not clearly show your face</div>
        <div className="kyc-rejected-reason-item">Name or details on document did not match account information</div>
      </div>

      <button className="kyc-resubmit-btn" onClick={onResubmit}>
        Resubmit Documents <ArrowRightIcon size={16} />
      </button>
    </div>
  );
}

function UploadZone({
  label, hint, file, accept, onChange, icon,
}: {
  label: string; hint: string; file: File | null;
  accept: string; onChange: (f: File | null) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className={`kyc-upload-zone ${file ? 'has-file' : ''}`}>
      <input type="file" accept={accept} onChange={e => onChange(e.target.files?.[0] || null)} />
      <div className="kyc-upload-icon">
        {file ? <CheckCircleIcon size={26} /> : icon}
      </div>
      <div className="kyc-upload-label">{label}</div>
      {file
        ? <div className="kyc-upload-filename">{file.name}</div>
        : <div className="kyc-upload-hint">{hint}</div>
      }
    </div>
  );
}

function SubmissionForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [docType, setDocType]       = useState<DocType>('passport');
  const [docFile, setDocFile]       = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const { fetchNotifications }      = useNotifications();
  const { refreshUser }             = useAuth();

  const handleSubmit = async () => {
    if (!docFile || !selfieFile) {
      toast.error('Please upload both your document and a selfie.');
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append('document_type', docType);
    form.append('document', docFile);
    form.append('selfie', selfieFile);
    const res = await kycApi.upload(form);
    setLoading(false);
    if (res.success) {
      toast.info('Documents submitted — your verification is now under review.');
      fetchNotifications();
      void refreshUser();
      onSuccess();
    } else {
      toast.error('Submission failed. Please try again.');
    }
  };

  const ready = Boolean(docFile && selfieFile);

  return (
    <>
      {/* Steps indicator */}
      <div className="kyc-steps">
        <div className="kyc-step">
          <div className={`kyc-step-circle ${docType ? 'active' : ''}`}>1</div>
          <div className={`kyc-step-label ${docType ? 'active' : ''}`}>Select Document</div>
        </div>
        <div className={`kyc-step-connector ${docFile ? 'done' : ''}`} />
        <div className="kyc-step">
          <div className={`kyc-step-circle ${docFile ? 'done' : docType ? 'active' : ''}`}>{docFile ? '✓' : '2'}</div>
          <div className={`kyc-step-label ${docFile ? 'done' : docType ? 'active' : ''}`}>Upload Files</div>
        </div>
        <div className={`kyc-step-connector ${ready ? 'done' : ''}`} />
        <div className="kyc-step">
          <div className={`kyc-step-circle ${ready ? 'active' : ''}`}>3</div>
          <div className={`kyc-step-label ${ready ? 'active' : ''}`}>Submit</div>
        </div>
      </div>

      <div className="kyc-form-card">
        <div className="kyc-form-card-title">Select Document Type</div>
        <div className="kyc-form-card-subtitle">Choose a government-issued ID that clearly shows your full name and date of birth.</div>

        <div className="kyc-doc-type-grid">
          {DOC_OPTIONS.map(({ value, label, desc, Icon }) => (
            <div
              key={value}
              className={`kyc-doc-type-option ${docType === value ? 'selected' : ''}`}
              onClick={() => setDocType(value)}
            >
              <div className="kyc-doc-type-icon"><Icon size={22} /></div>
              <div className="kyc-doc-type-label">{label}</div>
              <div className="kyc-doc-type-desc">{desc}</div>
            </div>
          ))}
        </div>

        <div className="kyc-form-card-title">Upload Your Files</div>
        <div className="kyc-form-card-subtitle" style={{ marginBottom: 20 }}>
          Ensure documents are clear, unedited, and fully visible. Accepted formats: JPG, PNG, PDF.
        </div>

        <div className="kyc-upload-row">
          <UploadZone
            label="Government ID"
            hint="JPG, PNG or PDF · Max 10 MB"
            file={docFile}
            accept="image/*,application/pdf"
            onChange={setDocFile}
            icon={<UploadIcon size={24} />}
          />
          <UploadZone
            label="Selfie Photo"
            hint="Hold your ID next to your face · JPG or PNG"
            file={selfieFile}
            accept="image/*"
            onChange={setSelfieFile}
            icon={<CameraIcon size={24} />}
          />
        </div>

        <div className="kyc-info-box">
          <InfoIcon size={16} />
          <p>
            <strong>Privacy note:</strong> Your documents are encrypted and only used for identity verification. They will never be shared with third parties without your consent.
          </p>
        </div>

        <button className="kyc-submit-btn" onClick={handleSubmit} disabled={loading || !ready}>
          {loading ? (
            <><div className="kyc-spinner" /> Submitting…</>
          ) : (
            <>Submit for Verification <ArrowRightIcon size={18} /></>
          )}
        </button>
      </div>

      <div className="kyc-tips-card">
        <div className="kyc-tips-title">
          <LightbulbIcon size={16} /> Tips for a Successful Submission
        </div>
        <div className="kyc-tips-grid">
          <div className="kyc-tip-item">Ensure all four corners of the document are visible</div>
          <div className="kyc-tip-item">Use good lighting — avoid glare and shadows</div>
          <div className="kyc-tip-item">Document must not be expired</div>
          <div className="kyc-tip-item">Selfie must clearly show your face (no sunglasses or hats)</div>
          <div className="kyc-tip-item">Hold your ID next to your face in the selfie photo</div>
          <div className="kyc-tip-item">File size should be under 10 MB per document</div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const KycPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [status, setStatus]   = useState<KycStatus>(normaliseStatus(user?.kyc_status));
  const [resubmit, setResubmit] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      const res = await kycApi.getStatus();
      if (res.success && res.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>;
        const raw  = (data.user as Record<string,unknown>)?.kyc_status ?? data.kyc_status ?? data.status ?? 'unverified';
        setStatus(normaliseStatus(raw));
      }
    };
    void loadStatus();
  }, []);

  const handlePending = () => {
    setStatus('pending');
    setResubmit(false);
    void refreshUser();
  };

  const showForm = status === 'unverified' || (status === 'rejected' && resubmit);

  return (
    <main className="history-page kyc-page">
      <div className="kyc-header">
        <div className="kyc-header-text">
          <h1 className="page-title">Identity Verification</h1>
          <p className="page-subtitle">Verify your identity to unlock full access to all platform features</p>
        </div>
      </div>

      <StatusBanner status={status} />

      {status === 'verified' && <VerifiedState />}

      {status === 'pending' && <PendingState />}

      {status === 'rejected' && !resubmit && (
        <RejectedState onResubmit={() => setResubmit(true)} />
      )}

      {showForm && <SubmissionForm onSuccess={handlePending} />}
    </main>
  );
};

export default KycPage;
