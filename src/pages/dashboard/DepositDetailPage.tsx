import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { depositsApi } from "../../lib/api";
import "../../assets/css/HistoryPage.css";
import { toast } from "react-toastify";

type AnyRec = Record<string, unknown>;

const DepositDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  // Flutterwave returns tx_ref (our reference) and status in query params
  const txRef = searchParams.get("tx_ref");
  const fwStatus = searchParams.get("status");
  
  // Use id from URL or tx_ref from query params
  const depositId = String(id || txRef || "");

  const [deposit, setDeposit] = useState<AnyRec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!depositId) return;
    setLoading(true);
    setError("");
    try {
      const res = await depositsApi.getById(depositId);
      if (res.success && res.data) {
        setDeposit(res.data as AnyRec);
        
        // If we came from a callback, show a toast based on Flutterwave status
        if (txRef && fwStatus) {
          if (fwStatus === 'completed' || fwStatus === 'successful') {
            toast.success("Deposit completed successfully!");
          } else {
            toast.error(`Deposit ${fwStatus}. Please check your history.`);
          }
          // Clean up URL by navigating to the canonical detail page
          navigate(`/dashboard/deposits/${depositId}`, { replace: true });
        }
      } else {
        setError(res.error?.message || "Failed to load deposit.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [depositId, txRef, fwStatus, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main className="history-page">
        <div className="page-header"><h1 className="page-title">Deposit</h1></div>
        <div className="loading-state" style={{ padding: "4rem", textAlign: "center" }}>Loading deposit...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="history-page">
        <div className="page-header"><h1 className="page-title">Deposit</h1></div>
        <div className="error-state" style={{ padding: "4rem", textAlign: "center", color: "#e74c3c" }}>{error}</div>
      </main>
    );
  }

  const d = deposit || {};
  const amount = Number(d.amount || 0);
  const currency = String(d.currency || "-");
  const status = String(d.status || "-");
  const provider = String(d.provider || d.gateway || "-");
  const createdAt = String(d.createdAt || d.date || "");

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposit Detail</h1>
          <p className="page-subtitle">Reference: {String(d.reference || d.id || depositId)}</p>
        </div>
        <button className="export-btn" onClick={() => navigate("/dashboard/deposits")}>Back to deposits</button>
      </div>

      <div className="summary-cards">
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Amount</span>
            <span className="summary-value">{new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} {currency}</span>
          </div>
        </div>
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Status</span>
            <span className="summary-value">{status}</span>
          </div>
        </div>
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Provider</span>
            <span className="summary-value">{provider}</span>
          </div>
        </div>
      </div>

      <div className="history-table-container" style={{ marginTop: 18 }}>
        <table className="history-table">
          <tbody>
            {[
              ["ID", String(d.id || depositId)],
              ["Currency", currency],
              ["Amount", String(d.amount || "0")],
              ["Provider", provider],
              ["Status", status],
              ["Date", createdAt ? new Date(createdAt).toLocaleString() : "-"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ fontWeight: 800, width: 220 }}>{k}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default DepositDetailPage;

