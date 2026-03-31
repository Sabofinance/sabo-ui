import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../assets/css/HistoryPage.css";

const DepositPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const depositType = String(searchParams.get("depositType") || "ngn").toLowerCase();

  const copy = useMemo(() => {
    if (depositType === "foreign") {
      return {
        title: "Deposit Processing",
        subtitle: "Your foreign deposit is being reviewed by our admin team.",
        bullets: [
          "We review your proof of payment and verify the deposit.",
          "Once verified, your wallet balance is credited automatically.",
          "If it doesn’t reflect after a few minutes, check your Deposits history."
        ],
      };
    }

    return {
      title: "Deposit Processing",
      subtitle: "If you just completed a Flutterwave payment, your wallet will be credited shortly.",
      bullets: [
        "Your payment is confirmed via Flutterwave webhook.",
        "Once confirmed, your NGN wallet balance updates automatically.",
        "If it doesn’t reflect after a few minutes, check your Deposits history."
      ],
    };
  }, [depositType]);

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{copy.title}</h1>
          <p className="page-subtitle">{copy.subtitle}</p>
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
              {copy.bullets.map((b) => (
                <React.Fragment key={b}>
                  - {b}
                  <br />
                </React.Fragment>
              ))}
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

