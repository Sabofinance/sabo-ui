import React, { useMemo, useState } from "react";
import { depositsApi } from "../../lib/api";
import "../../assets/css/HistoryPage.css";
import { useNavigate } from "react-router-dom";

const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"ngn" | "foreign">("ngn");
  const [ngnAmount, setNgnAmount] = useState("");
  const [foreignAmount, setForeignAmount] = useState("");
  const [foreignCurrency, setForeignCurrency] = useState<"GBP" | "USD" | "CAD">("GBP");
  const [foreignFile, setForeignFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadPct, setUploadPct] = useState<number>(0);

  const ngnRaw = useMemo(() => Number(String(ngnAmount).replace(/[^0-9.]/g, "")) || 0, [ngnAmount]);
  const foreignRaw = useMemo(() => Number(String(foreignAmount).replace(/[^0-9.]/g, "")) || 0, [foreignAmount]);

  const handleNgnDeposit = async () => {
    setLoading(true);
    setMessage("");
    const res = await depositsApi.ngnInitiate({ amount: String(ngnRaw) });
    setLoading(false);
    if (res.success) {
      const d: any = res.data || {};
      const paymentUrl =
        d?.paymentUrl ||
        d?.payment_url ||
        d?.payment_link ||
        d?.redirectUrl ||
        d?.redirect_url ||
        d?.url ||
        null;

      if (paymentUrl) {
        window.location.assign(String(paymentUrl));
        return;
      }
      // Fallback: show a pending info screen even if link isn't present.
      navigate("/dashboard/deposit-pending");
      setNgnAmount("");
    } else {
      setMessage(res.error?.message || "Failed to initiate NGN deposit.");
    }
  };

  const handleForeignDeposit = async () => {
    if (!foreignFile) {
      setMessage("Please upload a file.");
      return;
    }
    if (!foreignFile.type.startsWith("image/")) {
      setMessage("Proof of payment must be an image.");
      return;
    }
    setLoading(true);
    setMessage("");
    setUploadPct(0);
    const formData = new FormData();
    formData.append("currency", foreignCurrency);
    formData.append("amount", String(foreignRaw));
    formData.append("proof", foreignFile);
    const res = await depositsApi.foreign(formData, {
      onUploadProgress: (evt) => {
        if (!evt.total) return;
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setUploadPct(Math.max(0, Math.min(100, pct)));
      },
    });
    setLoading(false);
    if (res.success) {
      setMessage("Foreign deposit submitted successfully. It is pending admin review.");
      setForeignAmount("");
      setForeignFile(null);
      setUploadPct(0);
    } else {
      setMessage(res.error?.message || "Failed to submit foreign deposit.");
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
            <label>Currency</label>
            <select className="filter-select" value={foreignCurrency} onChange={(e) => setForeignCurrency(e.target.value as any)}>
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Amount (Foreign Currency)</label>
            <input className="filter-select" value={foreignAmount} onChange={e => setForeignAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <div className="filter-group">
            <label>Upload Proof of Payment</label>
            <input type="file" accept="image/*" onChange={e => setForeignFile(e.target.files?.[0] || null)} />
          </div>
          {loading && uploadPct > 0 && (
            <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
              Uploading proof: {uploadPct}%
            </div>
          )}
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
