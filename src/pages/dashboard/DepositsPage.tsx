import React, { useEffect, useState } from "react";
import { depositsApi } from "../../lib/api";
import { extractArray } from "../../lib/api/response";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/* ─── style constants ──────────────────────────────────────────────── */
const COLORS = {
  lime: "#C8F135",
  dark: "#0d1f1e",
  bg: "#f5f9f8",
  surface: "#ffffff",
  border: "#e0ebe9",
  textMain: "#0d1f1e",
  textMuted: "#7a9c99",
  textLight: "#b0ccc9",
  errorRed: "#e05252",
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  completed: {
    background: "rgba(200,241,53,0.15)",
    color: "#4a7a00",
    border: "1px solid rgba(200,241,53,0.4)",
  },
  approved: {
    background: "rgba(200,241,53,0.15)",
    color: "#4a7a00",
    border: "1px solid rgba(200,241,53,0.4)",
  },
  pending: {
    background: "rgba(255,189,46,0.12)",
    color: "#9a6200",
    border: "1px solid rgba(255,189,46,0.35)",
  },
  failed: {
    background: "rgba(224,82,82,0.1)",
    color: "#b83030",
    border: "1px solid rgba(224,82,82,0.3)",
  },
  cancelled: {
    background: "rgba(224,82,82,0.1)",
    color: "#b83030",
    border: "1px solid rgba(224,82,82,0.3)",
  },
};

const getStatusStyle = (s: string): React.CSSProperties =>
  STATUS_STYLE[s.toLowerCase()] ?? {
    background: "rgba(176,204,201,0.15)",
    color: "#4a6e6b",
    border: "1px solid rgba(176,204,201,0.35)",
  };

/* ─── skeleton row ─────────────────────────────────────────────────── */
const SkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <tr style={{ animationDelay: `${index * 60}ms` }}>
    {[120, 64, 88, 88, 72, 128].map((w, i) => (
      <td key={i} style={{ padding: "16px 20px" }}>
        <div
          style={{
            height: "12px",
            width: `${w}px`,
            borderRadius: "6px",
            background:
              "linear-gradient(90deg, #e8f0ef 25%, #d4e4e2 50%, #e8f0ef 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }}
        />
      </td>
    ))}
  </tr>
);

const DepositsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const response = await depositsApi.list();
      if (response.success) {
        setDeposits(extractArray(response.data));
      } else {
        const msg = response.error?.message || "Failed to load deposits";
        setError(msg);
        toast.error(msg);
      }
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .deposits-page * {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          box-sizing: border-box;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .deposits-page {
          min-height: 100vh;
          background: ${COLORS.bg};
          padding: 36px 32px;
        }

        .dep-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
          animation: fadeSlideIn 0.35s ease both;
        }

        .dep-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${COLORS.textMuted};
          margin-bottom: 6px;
        }

        .dep-page-title {
          font-size: 28px;
          font-weight: 800;
          color: ${COLORS.textMain};
          letter-spacing: -0.6px;
          margin: 0 0 4px;
          line-height: 1.15;
        }

        .dep-page-subtitle {
          font-size: 14px;
          color: ${COLORS.textMuted};
          margin: 0;
          font-weight: 500;
        }

        .dep-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 22px;
          border-radius: 12px;
          border: none;
          background: ${COLORS.lime};
          color: ${COLORS.dark};
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: -0.2px;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          white-space: nowrap;
          font-family: inherit;
        }

        .dep-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,241,53,0.4);
        }

        .dep-cta-btn:active {
          transform: translateY(0);
        }

        .dep-cta-btn svg {
          flex-shrink: 0;
        }

        /* stats strip */
        .dep-stats-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
          animation: fadeSlideIn 0.4s ease 0.05s both;
        }

        .dep-stat-card {
          background: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
          border-radius: 14px;
          padding: 16px 18px;
        }

        .dep-stat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${COLORS.textMuted};
          margin-bottom: 8px;
        }

        .dep-stat-value {
          font-size: 22px;
          font-weight: 800;
          color: ${COLORS.textMain};
          letter-spacing: -0.5px;
        }

        .dep-stat-value.lime {
          color: #4a7a00;
        }

        /* table container */
        .dep-table-wrap {
          background: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(13,31,30,0.05);
          animation: fadeSlideIn 0.45s ease 0.1s both;
        }

        .dep-table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid ${COLORS.border};
        }

        .dep-table-toolbar-title {
          font-size: 14px;
          font-weight: 700;
          color: ${COLORS.textMain};
        }

        .dep-table-count-badge {
          font-size: 12px;
          font-weight: 700;
          background: rgba(200,241,53,0.2);
          color: #4a7a00;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(200,241,53,0.4);
        }

        .dep-table {
          width: 100%;
          border-collapse: collapse;
        }

        .dep-table thead tr {
          border-bottom: 1px solid ${COLORS.border};
        }

        .dep-table thead th {
          padding: 12px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: ${COLORS.textMuted};
          white-space: nowrap;
        }

        .dep-table tbody tr {
          border-bottom: 1px solid ${COLORS.border};
          transition: background 0.12s ease;
          cursor: pointer;
          animation: fadeSlideIn 0.3s ease both;
        }

        .dep-table tbody tr:last-child {
          border-bottom: none;
        }

        .dep-table tbody tr:hover {
          background: #f0f7f6;
        }

        .dep-table td {
          padding: 15px 20px;
          font-size: 14px;
          font-weight: 500;
          color: ${COLORS.textMain};
          vertical-align: middle;
          white-space: nowrap;
        }

        .dep-table td.id-cell {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: ${COLORS.textMuted};
          font-weight: 600;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dep-table td.amount-cell {
          font-weight: 800;
          font-size: 15px;
          letter-spacing: -0.3px;
          color: ${COLORS.textMain};
        }

        .dep-currency-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 10px;
          background: rgba(13,31,30,0.06);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: ${COLORS.dark};
          letter-spacing: 0.04em;
        }

        .dep-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: capitalize;
        }

        .dep-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        .dep-row-arrow {
          color: ${COLORS.textLight};
          font-size: 16px;
          font-weight: 400;
          transition: transform 0.12s ease, color 0.12s ease;
        }

        .dep-table tbody tr:hover .dep-row-arrow {
          color: ${COLORS.textMuted};
          transform: translateX(3px);
        }

        /* empty / error states */
        .dep-empty-state {
          padding: 60px 20px;
          text-align: center;
        }

        .dep-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(200,241,53,0.12);
          border: 2px solid rgba(200,241,53,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .dep-empty-title {
          font-size: 16px;
          font-weight: 700;
          color: ${COLORS.textMain};
          margin-bottom: 6px;
        }

        .dep-empty-sub {
          font-size: 13px;
          color: ${COLORS.textMuted};
        }

        .dep-error-state {
          padding: 40px 20px;
          text-align: center;
          color: ${COLORS.errorRed};
          font-weight: 600;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .deposits-page { padding: 24px 16px; }
          .dep-table thead th:nth-child(4),
          .dep-table td:nth-child(4),
          .dep-table thead th:nth-child(6),
          .dep-table td:nth-child(6) { display: none; }
        }
      `}</style>

      <main className="deposits-page">
        {/* ── header ── */}
        <div className="dep-page-header">
          <div>
            <div className="dep-eyebrow">Finance</div>
            <h1 className="dep-page-title">Deposits</h1>
            <p className="dep-page-subtitle">
              View and manage your deposit history
            </p>
          </div>
          <button
            className="dep-cta-btn"
            onClick={() => navigate("/dashboard/deposit")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Make a Deposit
          </button>
        </div>

        {/* ── stats strip (derived from loaded data) ── */}
        {!loading &&
          !error &&
          deposits.length > 0 &&
          (() => {
            const total = deposits.reduce(
              (s, d) => s + Number((d as any).amount || 0),
              0,
            );
            const completed = deposits.filter((d) =>
              ["completed", "approved"].includes(
                String((d as any).status || "").toLowerCase(),
              ),
            ).length;
            const pending = deposits.filter(
              (d) =>
                String((d as any).status || "").toLowerCase() === "pending",
            ).length;
            return (
              <div className="dep-stats-strip">
                <div className="dep-stat-card">
                  <div className="dep-stat-label">Total Deposits</div>
                  <div className="dep-stat-value">{deposits.length}</div>
                </div>
                <div className="dep-stat-card">
                  <div className="dep-stat-label">Total Volume</div>
                  <div className="dep-stat-value" style={{ fontSize: "18px" }}>
                    {new Intl.NumberFormat("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(total)}
                  </div>
                </div>
                <div className="dep-stat-card">
                  <div className="dep-stat-label">Completed</div>
                  <div className="dep-stat-value lime">{completed}</div>
                </div>
                <div className="dep-stat-card">
                  <div className="dep-stat-label">Pending</div>
                  <div className="dep-stat-value">{pending}</div>
                </div>
              </div>
            );
          })()}

        {/* ── table ── */}
        <div className="dep-table-wrap">
          <div className="dep-table-toolbar">
            <span className="dep-table-toolbar-title">Transaction History</span>
            {!loading && !error && (
              <span className="dep-table-count-badge">
                {deposits.length} {deposits.length === 1 ? "record" : "records"}
              </span>
            )}
          </div>

          <table className="dep-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} index={i} />
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7}>
                    <div className="dep-error-state">⚠ {error}</div>
                  </td>
                </tr>
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="dep-empty-state">
                      <div className="dep-empty-icon">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4a7a00"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div className="dep-empty-title">No deposits yet</div>
                      <div className="dep-empty-sub">
                        Your deposit history will appear here once you make your
                        first deposit.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                deposits.map((deposit, index) => {
                  const id = String(
                    (deposit as any).id || (deposit as any)._id || index,
                  );
                  const currency = String((deposit as any).currency || "-");
                  const amount = Number((deposit as any).amount || 0);
                  const provider = String(
                    (deposit as any).provider ||
                      (deposit as any).gateway ||
                      "-",
                  );
                  const status = String((deposit as any).status || "-");
                  const dateRaw = String(
                    (deposit as any).createdAt || (deposit as any).date || "",
                  );
                  return (
                    <tr
                      key={id}
                      style={{ animationDelay: `${index * 40}ms` }}
                      onClick={() => navigate(`/dashboard/deposits/${id}`)}
                    >
                      <td className="id-cell" title={id}>
                        {id.length > 12 ? `${id.slice(0, 12)}…` : id}
                      </td>
                      <td>
                        <span className="dep-currency-pill">{currency}</span>
                      </td>
                      <td className="amount-cell">
                        {new Intl.NumberFormat("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(amount)}
                      </td>
                      <td style={{ color: COLORS.textMuted, fontWeight: 600 }}>
                        {provider}
                      </td>
                      <td>
                        <span
                          className="dep-status-badge"
                          style={getStatusStyle(status)}
                        >
                          <span className="dep-status-dot" />
                          {status}
                        </span>
                      </td>
                      <td
                        style={{
                          color: COLORS.textMuted,
                          fontWeight: 500,
                          fontSize: "13px",
                        }}
                      >
                        {dateRaw ? new Date(dateRaw).toLocaleString() : "-"}
                      </td>
                      <td>
                        <span className="dep-row-arrow">›</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default DepositsPage;
