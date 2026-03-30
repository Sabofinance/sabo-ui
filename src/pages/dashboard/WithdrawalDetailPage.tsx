import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { withdrawalsApi } from "../../lib/api";
import "../../assets/css/HistoryPage.css";

type AnyRec = Record<string, unknown>;

const WithdrawalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const withdrawalId = String(id || "");

  const [withdrawal, setWithdrawal] = useState<AnyRec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const res = await withdrawalsApi.getById(withdrawalId);
      if (res.success && res.data) setWithdrawal(res.data as AnyRec);
      else setError(res.error?.message || "Failed to load withdrawal.");
      setLoading(false);
    };
    if (withdrawalId) void load();
  }, [withdrawalId]);

  if (loading) {
    return (
      <main className="history-page">
        <div className="page-header"><h1 className="page-title">Withdrawal</h1></div>
        <div className="loading-state" style={{ padding: "4rem", textAlign: "center" }}>Loading withdrawal...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="history-page">
        <div className="page-header"><h1 className="page-title">Withdrawal</h1></div>
        <div className="error-state" style={{ padding: "4rem", textAlign: "center", color: "#e74c3c" }}>{error}</div>
      </main>
    );
  }

  const w = withdrawal || {};
  const currency = String(w.currency || "-");
  const amount = Number(w.amount || 0);
  const status = String(w.status || "-");
  const ref = String(w.reference || w.id || withdrawalId);
  const createdAt = String(w.createdAt || w.date || "");

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdrawal Detail</h1>
          <p className="page-subtitle">Reference: {ref}</p>
        </div>
        <button className="export-btn" onClick={() => navigate("/dashboard/withdrawals")}>Back to withdrawals</button>
      </div>

      <div className="summary-cards">
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Amount</span>
            <span className="summary-value">
              {new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} {currency}
            </span>
          </div>
        </div>
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Status</span>
            <span className="summary-value">{status}</span>
          </div>
        </div>
      </div>

      <div className="history-table-container" style={{ marginTop: 18 }}>
        <table className="history-table">
          <tbody>
            {[
              ["ID", String(w.id || withdrawalId)],
              ["Reference", ref],
              ["Currency", currency],
              ["Amount", String(w.amount || "0")],
              ["Status", status],
              ["Date", createdAt ? new Date(createdAt).toLocaleString() : "-"],
              ["Beneficiary", String((w.beneficiary as any)?.account_name || (w.beneficiary as any)?.name || w.beneficiary_name || "-")],
              ["Bank", String((w.beneficiary as any)?.bank_name || w.bank_name || "-")],
              ["Account Number", String((w.beneficiary as any)?.account_number || w.account_number || "-")],
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

export default WithdrawalDetailPage;

