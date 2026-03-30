import React from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/HistoryPage.css";

const DepositPendingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposit Processing</h1>
          <p className="page-subtitle">
            If you just completed a Flutterwave payment, your wallet will be credited shortly.
          </p>
        </div>
        <button className="export-btn" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">What happens next</span>
            <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.6 }}>
              - Your payment is confirmed via Flutterwave webhook.<br />
              - Once confirmed, your NGN wallet balance updates automatically.<br />
              - If it doesn’t reflect after a few minutes, check your Deposits history.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="export-btn" onClick={() => navigate("/dashboard/deposits")}>
          View deposit history
        </button>
        <button className="export-btn" style={{ background: "#C8F032", color: "#0A1E28" }} onClick={() => navigate("/dashboard/deposit")}>
          Make another deposit
        </button>
      </div>
    </main>
  );
};

export default DepositPendingPage;

