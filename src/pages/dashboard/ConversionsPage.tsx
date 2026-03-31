import React, { useCallback, useEffect, useMemo, useState } from "react";
import { conversionsApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CurrencyConverter from "../../components/CurrencyConverter";
import { extractArray } from "../../lib/api/response";

const C = {
  lime: "#C8F135",
  dark: "#0d1f1e",
  bg: "#f5f9f8",
  surface: "#ffffff",
  border: "#e0ebe9",
  muted: "#7a9c99",
  light: "#b0ccc9",
  error: "#e05252",
};


const ConversionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversions, setConversions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const kycStatus = String((user as any)?.kyc_status || "").toLowerCase();
  const isVerified = kycStatus === "verified";
  const isPending = kycStatus.includes("pending");

  const kycMessage = useMemo(() => {
    if (isVerified) return "";
    if (isPending)
      return "KYC is currently pending review. Conversions unlock once verified.";
    return "Complete your KYC to access conversions.";
  }, [isPending, isVerified]);

  const loadConversions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await conversionsApi.list();
      if (response.success) setConversions(extractArray(response.data));
      else setError(response.error?.message || "Failed to load conversions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isVerified) return;
    void loadConversions();
  }, [isVerified, loadConversions]);

  /* ── KYC gate ── */
  if (!isVerified) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          .conv-page * { font-family: 'DM Sans', -apple-system, sans-serif; box-sizing: border-box; }
        `}</style>
        <main
          className="conv-page"
          style={{ minHeight: "100vh", background: C.bg, padding: "36px 32px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: C.dark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.lime}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: C.muted,
                  marginBottom: 4,
                }}
              >
                Finance
              </div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.dark,
                  letterSpacing: "-0.5px",
                  margin: 0,
                }}
              >
                Conversions
              </h1>
            </div>
          </div>

          <div
            style={{
              maxWidth: 480,
              background: C.surface,
              border: `1px solid #fde68a`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(13,31,30,0.06)",
            }}
          >
            <div
              style={{
                background: "#fffbeb",
                padding: "18px 22px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                borderBottom: "1px solid #fde68a",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#fef3c7",
                  border: "2px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#92400e",
                    marginBottom: 4,
                  }}
                >
                  KYC Verification Required
                </div>
                <div
                  style={{
                    color: "#78350f",
                    fontSize: 13,
                    lineHeight: 1.55,
                    fontWeight: 500,
                  }}
                >
                  {kycMessage}
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 22px" }}>
              <button
                onClick={() => navigate("/dashboard/kyc")}
                style={{
                  padding: "13px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: C.lime,
                  color: C.dark,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(200,241,53,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Complete KYC →
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ── main page ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .conv-page * { font-family: 'DM Sans', -apple-system, sans-serif; box-sizing: border-box; }

        @keyframes convFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes convShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .conv-table { width: 100%; border-collapse: collapse; }
        .conv-table thead tr { border-bottom: 1px solid ${C.border}; }
        .conv-table thead th {
          padding: 12px 20px; text-align: left;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase; color: ${C.muted};
        }
        .conv-table tbody tr {
          border-bottom: 1px solid ${C.border};
          animation: convFadeUp 0.3s ease both;
          transition: background 0.12s ease;
        }
        .conv-table tbody tr:last-child { border-bottom: none; }
        .conv-table tbody tr:hover { background: #f0f7f6; }
        .conv-table td { padding: 15px 20px; font-size: 14px; font-weight: 500; color: ${C.dark}; vertical-align: middle; }
        .conv-table td.mono { font-family: 'Courier New', monospace; font-size: 12px; color: ${C.muted}; font-weight: 600; }

        @media (max-width: 640px) {
          .conv-page { padding: 20px 16px !important; }
        }
      `}</style>
      <div className="w-full flex justify-center">
        <main
          className="conv-page"
          style={{ minHeight: "100vh", background: C.bg, padding: "36px 32px" }}
        >
          {/* header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 32,
              animation: "convFadeUp 0.35s ease both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: C.dark,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.lime}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginBottom: 4,
                  }}
                >
                  Finance
                </div>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: C.dark,
                    letterSpacing: "-0.5px",
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  Conversions
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: C.muted,
                    margin: 0,
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  Enter rate manually to convert between currencies
                </p>
              </div>
            </div>
          </div>

          {/* converter widget */}
          <div
            style={{
              maxWidth: 500,
              marginBottom: 40,
              animation: "convFadeUp 0.4s ease 0.05s both",
            }}
          >
            <CurrencyConverter onSuccess={() => void loadConversions()} />
          </div>

          <div style={{ maxWidth: 860, margin: "0 auto", marginTop: 16 }}>
            {loading && <p>Loading your conversions...</p>}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            {!loading && !error && conversions.length === 0 && (
              <p>No conversions yet. Create one using the converter above.</p>
            )}
            {!loading && conversions.length > 0 && (
              <pre
                style={{
                  background: "#121212",
                  color: "#f7f7f7",
                  borderRadius: 10,
                  padding: 12,
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(conversions, null, 2)}
              </pre>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ConversionsPage;
