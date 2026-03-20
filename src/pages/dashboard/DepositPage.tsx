import React, { useState } from "react";
import { depositsApi } from "../../lib/api";
import "../../assets/css/HistoryPage.css";

const DepositPage: React.FC = () => {
  const [tab, setTab] = useState<"ngn" | "foreign">("ngn");
  const [ngnAmount, setNgnAmount] = useState("");
  const [foreignAmount, setForeignAmount] = useState("");
  const [foreignFile, setForeignFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleNgnDeposit = async () => {
    setLoading(true);
    setMessage("");
    const res = await depositsApi.ngnInitiate({ amount: ngnAmount });
    setLoading(false);
    if (res.success) {
      setMessage("Deposit initiated successfully.");
      setNgnAmount("");
    } else {
      setMessage("Failed to initiate NGN deposit.");
    }
  };

  const handleForeignDeposit = async () => {
    if (!foreignFile) {
      setMessage("Please upload a file.");
      return;
    }
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("amount", foreignAmount);
    formData.append("file", foreignFile);
    const res = await depositsApi.foreign(formData);
    setLoading(false);
    if (res.success) {
      setMessage("Foreign deposit submitted successfully.");
      setForeignAmount("");
      setForeignFile(null);
    } else {
      setMessage("Failed to submit foreign deposit.");
    }
  };

  return (
    <main className="history-page">
      <div className="page-header">
        <h1 className="page-title">Deposit Funds</h1>
      </div>
      <div className="summary-cards" style={{ marginBottom: "2rem" }}>
        <div className="summary-card" style={{ display: "flex", gap: 16 }}>
          <button className={tab === "ngn" ? "export-btn" : ""} onClick={() => setTab("ngn")}>NGN Deposit</button>
          <button className={tab === "foreign" ? "export-btn" : ""} onClick={() => setTab("foreign")}>Foreign Deposit</button>
        </div>
      </div>
      {tab === "ngn" ? (
        <div className="filters-section" style={{ maxWidth: 400 }}>
          <div className="filter-group">
            <label>Amount (NGN)</label>
            <input className="filter-select" value={ngnAmount} onChange={e => setNgnAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <button className="export-btn" onClick={handleNgnDeposit} disabled={loading} style={{ width: 200 }}>
            {loading ? "Processing..." : "Deposit"}
          </button>
        </div>
      ) : (
        <div className="filters-section" style={{ maxWidth: 400 }}>
          <div className="filter-group">
            <label>Amount (Foreign Currency)</label>
            <input className="filter-select" value={foreignAmount} onChange={e => setForeignAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <div className="filter-group">
            <label>Upload Proof of Payment</label>
            <input type="file" onChange={e => setForeignFile(e.target.files?.[0] || null)} />
          </div>
          <button className="export-btn" onClick={handleForeignDeposit} disabled={loading} style={{ width: 200 }}>
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      )}
      {message && (
        <div className={`notification ${message.includes("success") ? "success" : "error"}`} style={{ marginTop: "1rem", padding: "1rem", borderRadius: "8px", background: message.includes("success") ? "#e8f5e9" : "#ffebee", color: message.includes("success") ? "#2e7d32" : "#c62828" }}>
          {message}
        </div>
      )}
    </main>
  );
};

export default DepositPage;
