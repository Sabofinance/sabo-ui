import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tradesApi, disputesApi, ratingsApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import PinDotsInput from '../../components/PinDotsInput';
import '../../assets/css/TransactionPage.css';
import '../../assets/css/TransactionModals.css';

type TradeStatus = 'escrowed' | 'completed' | 'cancelled' | 'disputed';

interface TradeData {
  id: string;
  status: TradeStatus;
  amount: number;
  rate: number;
  total: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
  seller_id: string;
  buyer_id: string;
  seller_name: string;
  buyer_name: string;
  seller_avatar?: string;
  buyer_avatar?: string;
  payment_instructions?: string;
  dispute_status?: string;
}

const TradeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tradeId = id || "";

  const [trade, setTrade] = useState<TradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Modals & PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  // @ts-ignore
  const [pinAction, setPinAction] = useState<"sellerConfirm" | null>(null);

  // Dispute Modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  // Rating Modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const pollIntervalRef = useRef<number | null>(null);

  const isSeller = useMemo(() => trade?.seller_id === user?.id, [trade, user]);
  // @ts-ignore
  const isBuyer = useMemo(() => trade?.buyer_id === user?.id, [trade, user]);

  // Debugging logs for status tracing
  useEffect(() => {
    if (user) {
      console.log(
        `[TradeDetail] User: ${user.id}, KYC: ${user.kyc_status}, PIN Set: ${user.transaction_pin_set}`,
      );
    }
    if (trade) {
      console.log(
        `[TradeDetail] Trade: ${trade.id}, Status: ${trade.status}, Seller: ${trade.seller_id}, Buyer: ${trade.buyer_id}`,
      );
    }
  }, [user, trade]);

  const fetchTrade = useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const res = await tradesApi.getById(tradeId);
        if (res.success && res.data) {
          setTrade(res.data as TradeData);
          if (
            (res.data as TradeData).status === "completed" ||
            (res.data as TradeData).status === "cancelled"
          ) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        } else if (isInitial) {
          setError(res.error?.message || "Failed to load trade details.");
        }
      } catch (err) {
        if (isInitial) setError("An unexpected error occurred.");
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [tradeId],
  );

  useEffect(() => {
    fetchTrade(true);
    pollIntervalRef.current = setInterval(() => fetchTrade(), 15000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchTrade]);

  // Countdown Logic
  // @ts-ignore
  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    if (trade?.status !== "escrowed") return;
    const timer = setInterval(() => {
      const expiry = new Date(trade.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      if (diff <= 0) {
        setTimeLeft("00:00");
        clearInterval(timer);
        fetchTrade();
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(
          `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [trade, fetchTrade]);

  // Actions
  const handleSellerConfirm = () => {
    setPinAction("sellerConfirm");
    setShowPinModal(true);
  };

  const executePinAction = async () => {
    if (pin.length < 6) return;
    setProcessing(true);
    try {
      const res = await tradesApi.sellerConfirm(tradeId, { pin });

      if (res.success) {
        toast.success("Trade confirmed and completed!");
        setShowPinModal(false);
        setPin("");
        fetchTrade();
        setShowRatingModal(true);
      } else {
        const msg = res.error?.message || "Action failed.";
        if (msg.includes("INVALID_PIN"))
          toast.error("Invalid Transaction PIN.");
        else if (msg.includes("PIN_NOT_SET"))
          toast.error("Please set your Transaction PIN first.");
        else if (msg.includes("INSUFFICIENT_BALANCE"))
          toast.error("Insufficient wallet balance.");
        else toast.error(msg);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (disputeReason.length < 20) {
      toast.error("Dispute reason must be at least 20 characters.");
      return;
    }
    setProcessing(true);
    try {
      const res = await disputesApi.raise({
        trade_id: tradeId,
        reason: disputeReason,
      });
      if (res.success) {
        toast.success("Dispute raised successfully.");
        setShowDisputeModal(false);
        fetchTrade();
      } else {
        toast.error(res.error?.message || "Failed to raise dispute.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitRating = async () => {
    if (ratingScore === 0) {
      toast.error("Please select a rating.");
      return;
    }
    setProcessing(true);
    try {
      const res = await ratingsApi.create({
        trade_id: tradeId,
        score: ratingScore,
        comment: ratingComment,
      });
      if (res.success) {
        toast.success("Thank you for your feedback!");
        setShowRatingModal(false);
        navigate("/dashboard/trades");
      } else {
        toast.error(res.error?.message || "Failed to submit rating.");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="dashboard-wrapper">
        <main className="transaction-page">
          <p>Loading trade details...</p>
        </main>
      </div>
    );
  if (error || !trade)
    return (
      <div className="dashboard-wrapper">
        <main className="transaction-page">
          <p>{error || "Trade not found."}</p>
        </main>
      </div>
    );

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case "escrowed":
        return "#F59E0B";
      case "disputed":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  return (
    <div className="dashboard-wrapper">
      <main className="transaction-page">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard/trades")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5m7 7-7-7 7-7" />
          </svg>
          Back to Trades
        </button>

        <div className="transaction-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1>Trade Lifecycle</h1>
              <p>
                ID: <strong>{trade.id}</strong> • Status:{" "}
                <strong
                  style={{
                    color: getStatusColor(trade.status),
                    textTransform: "capitalize",
                  }}
                >
                  {trade.status}
                </strong>
              </p>
            </div>
            {trade.status !== "completed" && trade.status !== "cancelled" && (
              <button
                className="page-number"
                style={{ color: "#EF4444", borderColor: "#EF4444" }}
                onClick={() => setShowDisputeModal(true)}
              >
                Raise Dispute
              </button>
            )}
          </div>
        </div>

        <div className="spread-layout">
          <div className="exchange-card">
            <div className="display-group">
              <div>
                <span className="display-label">AMOUNT</span>
                <div className="locked-number">
                  {trade.amount.toLocaleString()}
                </div>
              </div>
              <div className="flag-section">
                <span className="currency-text">{trade.currency}</span>
              </div>
            </div>

            <div className="visual-bridge">
              <div className="bridge-line">
                <div className="bridge-node node-top"></div>
                <div className="bridge-node node-bottom"></div>
              </div>
            </div>

            <div className="display-group">
              <div>
                <span className="display-label">TOTAL (NGN)</span>
                <div className="locked-number">
                  {trade.total.toLocaleString()}
                </div>
              </div>
              <div className="flag-section">
                <span className="currency-text">NGN</span>
              </div>
            </div>

            <div className="rate-footer">
              <span className="rate-footer-label">Rate: </span>
              <span className="rate-footer-value">
                1 {trade.currency} = {trade.rate.toLocaleString()} NGN
              </span>
            </div>
          </div>

          <div className="info-sidebar">
            {/* Status-specific UI */}
            <div className="tile" style={{ background: "#F8FAFC" }}>
              <h3>Current Step</h3>

              {trade.status === "escrowed" && (
                <div>
                  {isSeller ? (
                    <>
                      <p style={{ marginBottom: 20 }}>
                        A buyer has initiated this trade. Confirm with your PIN
                        to complete the trade and release funds.
                      </p>
                      <button
                        className="confirm-btn-main"
                        onClick={handleSellerConfirm}
                        disabled={processing}
                      >
                        {processing
                          ? "Processing..."
                          : "Confirm & Complete Trade"}
                      </button>
                    </>
                  ) : (
                    <p>
                      Waiting for seller to accept the trade. Please hold on...
                    </p>
                  )}
                </div>
              )}

              {trade.status === "completed" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
                  <p>This trade has been completed successfully.</p>
                  <button
                    className="btn-market"
                    style={{ marginTop: 20 }}
                    onClick={() => setShowRatingModal(true)}
                  >
                    Rate Counterparty
                  </button>
                </div>
              )}

              {trade.status === "cancelled" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>❌</div>
                  <p>This trade has been cancelled.</p>
                </div>
              )}

              {trade.dispute_status && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 12,
                    background: "#FEE2E2",
                    borderRadius: 12,
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    fontWeight: 700,
                  }}
                >
                  Dispute Status: {trade.dispute_status.toUpperCase()}
                </div>
              )}
            </div>

            <div className="tile">
              <h3>Counterparty</h3>
              <div className="merchant-row">
                <img
                  src={
                    isSeller
                      ? trade.buyer_avatar || "https://via.placeholder.com/56"
                      : trade.seller_avatar || "https://via.placeholder.com/56"
                  }
                  className="merchant-avatar"
                  alt="avatar"
                />
                <div>
                  <div className="merchant-name">
                    {isSeller ? trade.buyer_name : trade.seller_name}
                  </div>
                  <div className="merchant-meta">
                    {isSeller ? "Buyer" : "Seller"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div
            className="confirm-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400 }}
          >
            <button
              className="modal-close-icon"
              onClick={() => setShowPinModal(false)}
            >
              ×
            </button>
            <h2>Enter PIN</h2>
            <p style={{ color: "#64748B", marginBottom: 24 }}>
              Enter your 6-digit transaction PIN to authorize this action.
            </p>
            <PinDotsInput
              value={pin}
              onChange={setPin}
              disabled={processing}
              autoFocus
            />
            <div className="modal-actions" style={{ marginTop: 30 }}>
              <button
                className="cancel-btn"
                onClick={() => setShowPinModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={executePinAction}
                disabled={processing || pin.length < 6}
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDisputeModal(false)}
        >
          <div
            className="confirm-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-icon"
              onClick={() => setShowDisputeModal(false)}
            >
              ×
            </button>
            <h2>Raise Dispute</h2>
            <p style={{ color: "#64748B", marginBottom: 16 }}>
              Describe the issue with this trade. Minimum 20 characters.
            </p>
            <textarea
              className="dispute-textarea"
              style={{
                width: "100%",
                minHeight: 120,
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                padding: 12,
                marginBottom: 20,
              }}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Provide details..."
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDisputeModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                style={{ background: "#EF4444" }}
                onClick={handleRaiseDispute}
                disabled={processing || disputeReason.length < 20}
              >
                {processing ? "Raising..." : "Raise Dispute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="success-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-icon"
              onClick={() => setShowRatingModal(false)}
            >
              ×
            </button>
            <h2 className="success-title">Rate Experience</h2>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                margin: "20px 0",
              }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRatingScore(n)}
                  style={{
                    fontSize: 24,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: ratingScore >= n ? "#C8F032" : "#E2E8F0",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              style={{
                width: "100%",
                minHeight: 80,
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                padding: 12,
                marginBottom: 20,
              }}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Optional comment..."
            />
            <button
              className="btn-market"
              onClick={handleSubmitRating}
              disabled={processing}
            >
              {processing ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeDetailPage;