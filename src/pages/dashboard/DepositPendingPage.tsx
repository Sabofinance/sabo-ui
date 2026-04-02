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

      <div className="summary-cards" style={{ display: 'block' }}>
        <div className="summary-card" style={{ padding: '24px' }}>
          <div className="summary-info">
            <span className="summary-label" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b' }}>
              WHAT HAPPENS NEXT
            </span>
            <div style={{ marginTop: 20 }}>
              {copy.bullets.map((b, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  gap: '14px', 
                  marginBottom: i === copy.bullets.length - 1 ? 0 : '18px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: '#C8F032', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#0A1E28'
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ 
                    margin: 0, 
                    color: '#334155', 
                    fontSize: '14.5px', 
                    lineHeight: '1.5',
                    fontWeight: 500 
                  }}>
                    {b}
                  </p>
                </div>
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

