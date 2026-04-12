import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { disputesApi } from '../../lib/api';
import { extractArray } from '../../lib/api/response';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import '../../assets/css/DisputesPage.css';

/* ─── Types ──────────────────────────────────────────────────── */
type DisputeStatus = 'open' | 'resolved' | 'closed';

interface Dispute {
  id: string;
  trade_id: string;
  raised_by_id: string;
  reason: string;
  status: DisputeStatus;
  resolution_note: string | null;
  trade_reference: string;
  trade_currency: string;
  trade_amount: string;
  trade_total_ngn: string;
  trade_status: string;
  created_at: string;
}

/* ─── Icons ──────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const AlertIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckCircleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
);

const FileIcon = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const InfoIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────── */
const fmt = (amount: string, currency: string) => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const normaliseStatus = (raw: unknown): DisputeStatus => {
  const s = String(raw || '').toLowerCase();
  if (s === 'resolved') return 'resolved';
  if (s === 'closed') return 'closed';
  return 'open';
};

/* ─── Sub-components ─────────────────────────────────────────── */

function StatusPill({ status }: { status: DisputeStatus }) {
  const icons = {
    open:     <AlertIcon size={12} />,
    resolved: <CheckCircleIcon size={12} />,
    closed:   <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF' }} />,
  };
  return (
    <span className={`dispute-status-pill ${status}`}>
      {icons[status]} {status}
    </span>
  );
}

function DisputeCard({ dispute }: { dispute: Dispute }) {
  const [expanded, setExpanded] = useState(false);
  const status = normaliseStatus(dispute.status);

  return (
    <div className={`dispute-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(v => !v)}>
      <div className="dispute-card-main">
        <div className={`dispute-status-dot ${status}`} />

        <div className="dispute-card-info">
          <div className="dispute-card-top">
            <span className="dispute-ref">#{String(dispute.id || '').slice(0, 8).toUpperCase()}</span>
            {dispute.trade_reference && (
              <span className="dispute-trade-ref">Trade {dispute.trade_reference}</span>
            )}
            <StatusPill status={status} />
          </div>
          <div className="dispute-reason-preview">{dispute.reason || '—'}</div>
        </div>

        <div className="dispute-card-meta">
          <div className="dispute-amount">
            {dispute.trade_currency
              ? fmt(dispute.trade_amount, dispute.trade_currency)
              : '—'}
          </div>
          <div className="dispute-date">{dispute.created_at ? fmtDate(dispute.created_at) : '—'}</div>
        </div>

        <div className={`dispute-chevron ${expanded ? 'open' : ''}`}>
          <ChevronDownIcon />
        </div>
      </div>

      {expanded && (
        <div className="dispute-card-expanded" onClick={e => e.stopPropagation()}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="dispute-detail-section">
              <div className="dispute-detail-label">Reason for Dispute</div>
              <div className="dispute-reason-full">{dispute.reason || '—'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="dispute-detail-section">
                <div className="dispute-detail-label">Trade Amount</div>
                <div className="dispute-detail-value">
                  {dispute.trade_currency ? fmt(dispute.trade_amount, dispute.trade_currency) : '—'}
                </div>
              </div>
              <div className="dispute-detail-section">
                <div className="dispute-detail-label">Total (NGN)</div>
                <div className="dispute-detail-value">
                  {dispute.trade_total_ngn ? fmt(dispute.trade_total_ngn, 'NGN') : '—'}
                </div>
              </div>
              <div className="dispute-detail-section">
                <div className="dispute-detail-label">Trade Status</div>
                <div className="dispute-detail-value" style={{ textTransform: 'capitalize' }}>
                  {dispute.trade_status || '—'}
                </div>
              </div>
              <div className="dispute-detail-section">
                <div className="dispute-detail-label">Raised On</div>
                <div className="dispute-detail-value">
                  {dispute.created_at ? fmtDate(dispute.created_at) : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="dispute-detail-section">
              <div className="dispute-detail-label">Admin Resolution</div>
              <div className={`dispute-resolution-box ${!dispute.resolution_note ? 'empty' : ''}`}>
                {dispute.resolution_note || 'Pending review by our compliance team. You will be notified once a resolution is reached.'}
              </div>
            </div>

            <div className="dispute-detail-section">
              <div className="dispute-detail-label">Dispute ID</div>
              <div className="dispute-detail-value" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                {dispute.id || '—'}
              </div>
            </div>

            <div className="dispute-detail-section">
              <div className="dispute-detail-label">Trade ID</div>
              <div className="dispute-detail-value" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                {dispute.trade_id || '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RaiseDisputeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [tradeId, setTradeId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const MIN_REASON = 20;

  const charStatus = reason.length === 0 ? '' : reason.length < MIN_REASON ? 'warn' : 'ok';

  const handleSubmit = async () => {
    if (!tradeId.trim()) { toast.error('Please enter your Trade ID.'); return; }
    if (reason.length < MIN_REASON) {
      toast.error(`Reason must be at least ${MIN_REASON} characters.`);
      return;
    }
    setSubmitting(true);
    const res = await disputesApi.raise({ trade_id: tradeId.trim(), reason: reason.trim() });
    setSubmitting(false);
    if (res.success) {
      toast.success('Dispute raised successfully. Our team will review it shortly.');
      onSuccess();
    } else {
      toast.error(res.error?.message || 'Failed to raise dispute. Please try again.');
    }
  };

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="disputes-modal-overlay" onClick={handleOverlayClick}>
      <div className="disputes-modal" onClick={e => e.stopPropagation()}>
        <div className="disputes-modal-header">
          <div className="disputes-modal-title">Raise a Dispute</div>
          <button className="disputes-modal-close" onClick={onClose}><XIcon /></button>
        </div>

        <div className="disputes-modal-body">
          <p className="disputes-modal-subtitle">
            Disputes can only be raised on active trades (funds in escrow). Provide your Trade ID and a clear description of the issue.
          </p>

          <div className="disputes-field">
            <label>Trade ID</label>
            <input
              type="text"
              placeholder="e.g. 3f9a1c2d-…"
              value={tradeId}
              onChange={e => setTradeId(e.target.value)}
            />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              Find your Trade ID on the <strong style={{ color: '#0A1E28' }}>Trades</strong> page.
            </span>
          </div>

          <div className="disputes-field">
            <label>Reason for Dispute</label>
            <textarea
              placeholder="Describe the issue in detail — e.g. the seller has not responded after I confirmed payment 2 hours ago…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <span className={`disputes-char-count ${charStatus}`}>
              {reason.length} / {MIN_REASON} min characters
              {charStatus === 'ok' && ' ✓'}
            </span>
          </div>

          <div className="disputes-warning-box">
            <WarningIcon />
            <span>
              <strong style={{ color: '#0A1E28' }}>Please note:</strong> Disputes are mediated by our compliance team. Raising a false or bad-faith dispute may result in account suspension. Only raise a dispute if you have a genuine issue with an active trade.
            </span>
          </div>

          <div className="disputes-modal-footer">
            <button className="disputes-cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button
              className="disputes-submit-btn"
              onClick={handleSubmit}
              disabled={submitting || reason.length < MIN_REASON || !tradeId.trim()}
            >
              {submitting ? <><div className="disputes-spinner" /> Submitting…</> : 'Raise Dispute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
const DisputesPage: React.FC = () => {
  const [disputes, setDisputes]     = useState<Dispute[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal]   = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await disputesApi.list({ page, limit: 10 });
      if (res.success) {
        setDisputes(extractArray(res.data) as Dispute[]);
        const meta = (res.data as any)?.meta || (res.data as any);
        setTotalPages(meta?.totalPages || meta?.last_page || 1);
        setCurrentPage(page);
      } else {
        setError(res.error?.message || 'Failed to load disputes');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(1); }, [load]);

  const stats = useMemo(() => ({
    total:    disputes.length,
    open:     disputes.filter(d => normaliseStatus(d.status) === 'open').length,
    resolved: disputes.filter(d => normaliseStatus(d.status) === 'resolved').length,
  }), [disputes]);

  const handleRaiseSuccess = () => {
    setShowModal(false);
    void load(1);
  };

  return (
    <main className="history-page disputes-page">
      {/* Header */}
      <div className="disputes-header">
        <div className="disputes-header-text">
          <h1 className="page-title">Disputes</h1>
          <p className="page-subtitle">Track and manage disputes on your trades</p>
        </div>
        <button className="raise-dispute-btn" onClick={() => setShowModal(true)}>
          <PlusIcon /> Raise a Dispute
        </button>
      </div>

      {/* Stats */}
      <div className="disputes-stats">
        <div className="dispute-stat-card">
          <div className="dispute-stat-icon total">
            <FileIcon size={22} />
          </div>
          <div className="dispute-stat-info">
            <span className="dispute-stat-label">Total Disputes</span>
            <span className="dispute-stat-value">{loading ? '—' : stats.total}</span>
          </div>
        </div>
        <div className="dispute-stat-card">
          <div className="dispute-stat-icon open">
            <AlertIcon size={22} />
          </div>
          <div className="dispute-stat-info">
            <span className="dispute-stat-label">Open</span>
            <span className="dispute-stat-value" style={{ color: stats.open > 0 ? '#E74C3C' : undefined }}>
              {loading ? '—' : stats.open}
            </span>
          </div>
        </div>
        <div className="dispute-stat-card">
          <div className="dispute-stat-icon resolved">
            <CheckCircleIcon size={22} />
          </div>
          <div className="dispute-stat-info">
            <span className="dispute-stat-label">Resolved</span>
            <span className="dispute-stat-value" style={{ color: stats.resolved > 0 ? '#2ECC71' : undefined }}>
              {loading ? '—' : stats.resolved}
            </span>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="disputes-info-banner">
        <InfoIcon size={16} />
        <p>
          Disputes can only be raised on trades that are <strong>currently in escrow</strong>.
          Once raised, our compliance team will review the case and contact both parties.
          You can follow up via in-app chat. Resolution typically takes <strong>24–72 hours</strong>.
        </p>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="disputes-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="disputes-skeleton-card">
              <div className="skeleton-line" style={{ width: 12, height: 12, borderRadius: '50%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton-line" style={{ height: 14, width: '40%' }} />
                <div className="skeleton-line" style={{ height: 12, width: '70%' }} />
              </div>
              <div className="skeleton-line" style={{ height: 16, width: 80 }} />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ padding: '16px 20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 14, color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && disputes.length === 0 && (
        <div className="disputes-empty">
          <div className="disputes-empty-icon">
            <FileIcon size={36} />
          </div>
          <div className="disputes-empty-title">No disputes yet</div>
          <div className="disputes-empty-subtitle">
            You haven't raised any disputes. If you experience an issue with an active trade, use the button above to open a case.
          </div>
          <button className="raise-dispute-btn" style={{ marginTop: 8 }} onClick={() => setShowModal(true)}>
            <PlusIcon /> Raise a Dispute
          </button>
        </div>
      )}

      {/* Disputes list */}
      {!loading && !error && disputes.length > 0 && (
        <>
          <div className="disputes-list">
            {disputes.map(d => <DisputeCard key={d.id} dispute={d} />)}
          </div>

          <div style={{ marginTop: 24 }}>
            <Pagination
              currentPage={currentPage}
              total={totalPages}
              limit={10}
              onPageChange={(p) => void load(p)}
              isLoading={loading}
            />
          </div>
        </>
      )}

      {/* Raise Dispute Modal */}
      {showModal && (
        <RaiseDisputeModal
          onClose={() => setShowModal(false)}
          onSuccess={handleRaiseSuccess}
        />
      )}
    </main>
  );
};

export default DisputesPage;
