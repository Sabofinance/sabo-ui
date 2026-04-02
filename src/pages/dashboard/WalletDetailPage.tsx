import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ledgerApi, walletsApi } from "../../lib/api";
import { extractArray } from "../../lib/api/response";
import "../../assets/css/HistoryPage.css";

type AnyRec = Record<string, unknown>;

const WalletDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { currency: currencyParam } = useParams();
  const currency = String(currencyParam || "").toUpperCase();

  const [wallet, setWallet] = useState<AnyRec | null>(null);
  const [entries, setEntries] = useState<AnyRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const balances = useMemo(() => {
    const w = wallet || {};
    const available =
      Number(w.available_balance ?? w.availableBalance ?? w.available ?? w.balance ?? 0) || 0;
    const locked = Number(w.locked_balance ?? w.lockedBalance ?? w.locked ?? 0) || 0;
    const total = Number(w.total_balance ?? w.totalBalance ?? w.total ?? available + locked) || (available + locked);
    const symbol = String(w.symbol || (currency === "NGN" ? "₦" : currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "CAD" ? "CA$" : ""));
    return { available, locked, total, symbol };
  }, [wallet, currency]);

  useEffect(() => {
    const run = async () => {
      if (!currency) return;
      setLoading(true);
      setError("");
      setWallet(null);
      setEntries([]);

      const walletRes = await walletsApi.getByCurrency(currency);
      if (!walletRes.success || !walletRes.data) {
        setError(walletRes.error?.message || "Failed to load wallet.");
        setLoading(false);
        return;
      }

      const w = walletRes.data as AnyRec;
      setWallet(w);

      const walletId = String(w.id || w.walletId || "");
      if (walletId) {
        const ledgerRes = await ledgerApi.listByWalletId(walletId, { limit: 50 });
        if (ledgerRes.success) {
          setEntries(extractArray(ledgerRes.data));
        }
      }

      setLoading(false);
    };
    void run();
  }, [currency]);

  if (loading) {
    return (
      <main className="history-page">
        <div className="page-header">
          <h1 className="page-title">Wallet</h1>
        </div>
        <div className="loading-state" style={{ padding: "4rem", textAlign: "center" }}>
          Loading wallet...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="history-page">
        <div className="page-header">
          <h1 className="page-title">Wallet</h1>
        </div>
        <div className="error-state" style={{ padding: "4rem", textAlign: "center", color: "#e74c3c" }}>
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{currency} Wallet</h1>
          <p className="page-subtitle">Balance breakdown and wallet ledger history</p>
        </div>
        <button className="export-btn" onClick={() => navigate("/dashboard/wallets")}>
          Back to wallets
        </button>
      </div>

      <div className="summary-cards" style={{ marginBottom: "2rem" }}>
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Available balance</span>
            <span className="summary-value" style={{ fontSize: "2rem" }}>
              {balances.symbol}
              {new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balances.available)}
            </span>
          </div>
        </div>
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">
              Locked balance{" "}
              <span title="These funds are committed to active trades and cannot be withdrawn until the trade completes or is cancelled.">
                (?)
              </span>
            </span>
            <span className="summary-value" style={{ fontSize: "2rem" }}>
              {balances.symbol}
              {new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balances.locked)}
            </span>
          </div>
        </div>
        <div className="summary-card" style={{ flex: 1 }}>
          <div className="summary-info">
            <span className="summary-label">Total</span>
            <span className="summary-value" style={{ fontSize: "2rem" }}>
              {balances.symbol}
              {new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balances.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Currency</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "#6b7280" }}>
                  No ledger entries for this wallet yet.
                </td>
              </tr>
            ) : (
              entries.map((e, idx) => (
                <tr key={String(e.id || idx)}>
                  <td>{String(e.reference || e.id || "-")}</td>
                  <td>{new Date(String(e.createdAt || e.date || "")).toLocaleString()}</td>
                  <td>{String(e.type || "-")}</td>
                  <td>{String(e.currency || currency)}</td>
                  <td>
                    {balances.symbol}
                    {new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(e.amount || 0))}
                  </td>
                  <td>{String(e.status || "-")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default WalletDetailPage;

