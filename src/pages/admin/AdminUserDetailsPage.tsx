import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/api";

/* ─── Types ─────────────────────────────────────────────── */
interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: string;
  locked_balance: string;
  escrow_balance: string;
  updated_at: string;
}

interface UserRecord {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role: string;
  kyc_status?: string;
  is_suspended?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at?: string;
  createdAt?: string;
  wallets?: Wallet[];
  [key: string]: unknown;
}

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (val: unknown) => (val == null || val === "" ? "—" : String(val));

const fmtDate = (val: unknown) => {
  if (!val) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(String(val)));
  } catch {
    return String(val);
  }
};

const fmtCurrency = (amount: string, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  } catch {
    return `${currency} ${amount}`;
  }
};

const currencyFlag: Record<string, string> = {
  NGN: "🇳🇬",
  USD: "🇺🇸",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
  EUR: "🇪🇺",
};

/* ─── Sub-components ─────────────────────────────────────── */
const StatusPill: React.FC<{ suspended?: boolean }> = ({ suspended }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.04em",
      background: suspended ? "#fff1f0" : "#f0fdf4",
      color: suspended ? "#cf1322" : "#15803d",
      border: `1px solid ${suspended ? "#ffa39e" : "#bbf7d0"}`,
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: suspended ? "#ef4444" : "#22c55e",
        boxShadow: `0 0 6px ${suspended ? "#ef4444" : "#22c55e"}`,
        flexShrink: 0,
      }}
    />
    {suspended ? "Suspended" : "Active"}
  </span>
);

const VerifiedBadge: React.FC<{ verified?: boolean; label: string }> = ({
  verified,
  label,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 500,
      background: verified ? "#eff6ff" : "#f9fafb",
      color: verified ? "#1d4ed8" : "#6b7280",
      border: `1px solid ${verified ? "#bfdbfe" : "#e5e7eb"}`,
    }}
  >
    {verified ? (
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )}
    {label}
  </span>
);

const KycBadge: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status || "unverified").toLowerCase();
  const map: Record<
    string,
    { bg: string; color: string; border: string; label: string }
  > = {
    verified: {
      bg: "#f0fdf4",
      color: "#15803d",
      border: "#bbf7d0",
      label: "Verified",
    },
    pending: {
      bg: "#fffbeb",
      color: "#b45309",
      border: "#fde68a",
      label: "Pending",
    },
    unverified: {
      bg: "#fafafa",
      color: "#6b7280",
      border: "#e5e7eb",
      label: "Unverified",
    },
    rejected: {
      bg: "#fff1f0",
      color: "#cf1322",
      border: "#ffa39e",
      label: "Rejected",
    },
  };
  const style = map[s] ?? map.unverified;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {style.label}
    </span>
  );
};

const InfoRow: React.FC<{
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}> = ({ label, children, mono }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "11px 0",
      borderBottom: "1px solid #f1f5f9",
    }}
  >
    <span
      style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, minWidth: 110 }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 13,
        color: "#0f172a",
        fontWeight: 500,
        textAlign: "right",
        fontFamily: mono ? "'DM Mono', monospace" : "inherit",
        wordBreak: "break-all",
      }}
    >
      {children}
    </span>
  </div>
);

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, icon, children, style: extraStyle }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e8edf3",
      borderRadius: 14,
      padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
      ...extraStyle,
    }}
  >
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}
    >
      <span style={{ color: "#64748b" }}>{icon}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#94a3b8",
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ height: 1, background: "#f1f5f9", margin: "10px 0 2px" }} />
    {children}
  </div>
);

const Icon = (d: string, size = 16) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/* ─── Page ───────────────────────────────────────────────── */
const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      const res = await adminApi.getUserById(id);
      if (res.success && res.data) {
        // Handle both { user: {...} } and flat shapes from the backend
        const payload = res.data as Record<string, unknown>;
        setUser((payload.user ?? payload) as UserRecord);
      } else {
        toast.error(res.error?.message || "User not found");
      }
      setLoading(false);
    };
    void fetchUser();
  }, [id, toast]);

  /* ── Loading / error states ── */
  if (!id)
    return (
      <main style={{ padding: 32 }}>
        <p style={{ color: "#ef4444" }}>Missing user ID.</p>
      </main>
    );

  if (loading || !user)
    return (
      <main
        style={{
          padding: 32,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#94a3b8",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading user details…
      </main>
    );

  const displayName =
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Unknown User";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const wallets: Wallet[] = Array.isArray(user.wallets) ? user.wallets : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@400;500;600;700&display=swap');

        .udp-root {
          font-family: 'Geist', sans-serif;
          min-height: 100vh;
          background: #f6f8fb;
          padding: 28px 32px 48px;
          box-sizing: border-box;
        }

        .udp-root * { box-sizing: border-box; }

        .udp-header { margin-bottom: 24px; }

        .udp-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #94a3b8; margin-bottom: 10px;
        }

        .udp-breadcrumb a { color: #64748b; text-decoration: none; }
        .udp-breadcrumb a:hover { color: #0f172a; }

        .udp-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px; color: #0f172a;
          margin: 0 0 2px; font-weight: 400;
        }

        .udp-sub {
          font-size: 13px; color: #94a3b8; margin: 0;
          font-family: 'DM Mono', monospace;
        }

        .udp-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 18px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .udp-root { padding: 20px 16px 40px; }
          .udp-grid { grid-template-columns: 1fr; }
        }

        .udp-right-col { display: flex; flex-direction: column; gap: 18px; }

        /* Avatar card */
        .avatar-card {
          background: #fff;
          border: 1px solid #e8edf3;
          border-radius: 14px;
          padding: 28px 24px;
          text-align: center;
          box-shadow: 0 1px 4px rgba(15,23,42,0.04);
        }

        .avatar-ring {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #dbeafe, #ede9fe);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          font-size: 22px; font-weight: 700; color: #3730a3;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #e0e7ff, 0 4px 12px rgba(55,48,163,0.12);
        }

        .avatar-name {
          font-family: 'Instrument Serif', serif;
          font-size: 20px; color: #0f172a; margin: 0 0 4px;
        }

        .avatar-email {
          font-size: 12px; color: #94a3b8;
          font-family: 'DM Mono', monospace; margin: 0 0 14px;
        }

        .avatar-badges {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;
          margin-bottom: 16px;
        }

        .avatar-id {
          font-family: 'DM Mono', monospace;
          font-size: 10px; color: #94a3b8;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 6px; padding: 5px 10px;
          word-break: break-all; text-align: left;
          cursor: pointer; transition: background 0.15s;
        }
        .avatar-id:hover { background: #f1f5f9; }

        /* Wallet cards */
        .wallet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
          margin-top: 8px;
        }

        .wallet-card {
          background: #f8fafc;
          border: 1px solid #e8edf3;
          border-radius: 10px;
          padding: 12px 14px;
          transition: box-shadow 0.15s, border-color 0.15s;
        }

        .wallet-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(15,23,42,0.06);
        }

        .wallet-flag { font-size: 18px; margin-bottom: 6px; display: block; }

        .wallet-currency {
          font-size: 11px; font-weight: 700; color: #475569;
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 4px;
        }

        .wallet-balance {
          font-size: 15px; font-weight: 700; color: #0f172a;
          font-variant-numeric: tabular-nums;
          margin-bottom: 6px;
        }

        .wallet-sub-row {
          display: flex; flex-direction: column; gap: 2px;
        }

        .wallet-sub {
          font-size: 10px; color: #94a3b8;
          font-family: 'DM Mono', monospace;
        }

        /* Raw JSON toggle */
        .raw-toggle {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: 1px solid #e2e8f0;
          border-radius: 8px; padding: 6px 12px;
          font-size: 12px; color: #64748b; cursor: pointer;
          font-family: 'DM Mono', monospace;
          transition: all 0.15s;
          margin-bottom: 10px;
        }
        .raw-toggle:hover { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }

        .raw-pre {
          background: #0f172a; color: #94a3b8;
          border-radius: 10px; padding: 18px 20px;
          overflow-x: auto; font-size: 12px; line-height: 1.7;
          font-family: 'DM Mono', monospace;
          border: none;
          max-height: 420px;
        }
      `}</style>

      <main className="udp-root">
        {/* Header */}
        <div className="udp-header">
          <div className="udp-breadcrumb">
            <a href="/dashboard/admin">Dashboard</a>
            <span>›</span>
            <a href="/dashboard/admin/users">Users</a>
            <span>›</span>
            <span>{displayName}</span>
          </div>
          <h1 className="udp-title">User Details</h1>
          <p className="udp-sub">Full profile and wallet overview</p>
        </div>

        <div className="udp-grid">
          {/* Left col — identity card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="avatar-card">
              <div className="avatar-ring">{initials}</div>
              <h2 className="avatar-name">{displayName}</h2>
              <p className="avatar-email">{fmt(user.email)}</p>

              <div className="avatar-badges">
                <StatusPill suspended={Boolean(user.is_suspended)} />
                <KycBadge status={user.kyc_status as string} />
              </div>

              <div className="avatar-badges">
                <VerifiedBadge
                  verified={Boolean(user.email_verified)}
                  label="Email"
                />
                <VerifiedBadge
                  verified={Boolean(user.phone_verified)}
                  label="Phone"
                />
              </div>

              <div
                className="avatar-id"
                title="Click to copy"
                onClick={() => {
                  navigator.clipboard.writeText(fmt(user.id));
                }}
              >
                uid: {fmt(user.id)}
              </div>
            </div>

            {/* Profile details */}
            <SectionCard
              title="Profile"
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              }
            >
              <InfoRow label="Role">{fmt(user.role)}</InfoRow>
              <InfoRow label="Phone" mono>
                {fmt(user.phone || user.phoneNumber)}
              </InfoRow>
              <InfoRow label="Joined">
                {fmtDate(user.created_at || user.createdAt)}
              </InfoRow>
              <InfoRow label="KYC">
                <KycBadge status={user.kyc_status as string} />
              </InfoRow>
            </SectionCard>
          </div>

          {/* Right col */}
          <div className="udp-right-col">
            {/* Wallets */}
            {wallets.length > 0 && (
              <SectionCard
                title="Wallets"
                icon={
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                    <circle
                      cx="7"
                      cy="15"
                      r="1.5"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                }
              >
                <div className="wallet-grid">
                  {wallets.map((w) => (
                    <div className="wallet-card" key={w.id}>
                      <span className="wallet-flag">
                        {currencyFlag[w.currency] ?? "💳"}
                      </span>
                      <div className="wallet-currency">{w.currency}</div>
                      <div className="wallet-balance">
                        {fmtCurrency(w.balance, w.currency)}
                      </div>
                      <div className="wallet-sub-row">
                        <span className="wallet-sub">
                          Locked: {fmtCurrency(w.locked_balance, w.currency)}
                        </span>
                        <span className="wallet-sub">
                          Escrow: {fmtCurrency(w.escrow_balance, w.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Account details */}
            <SectionCard
              title="Account"
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
            >
              <InfoRow label="Email" mono>
                {fmt(user.email)}
              </InfoRow>
              <InfoRow label="Email verified">
                <VerifiedBadge
                  verified={Boolean(user.email_verified)}
                  label={user.email_verified ? "Verified" : "Unverified"}
                />
              </InfoRow>
              <InfoRow label="Phone verified">
                <VerifiedBadge
                  verified={Boolean(user.phone_verified)}
                  label={user.phone_verified ? "Verified" : "Unverified"}
                />
              </InfoRow>
              <InfoRow label="Suspended">
                <StatusPill suspended={Boolean(user.is_suspended)} />
              </InfoRow>
            </SectionCard>

            {/* Raw JSON */}
            <div>
              <button
                className="raw-toggle"
                onClick={() => setShowRaw((v) => !v)}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                {showRaw ? "Hide" : "Show"} raw JSON
              </button>
              {showRaw && (
                <pre className="raw-pre">{JSON.stringify(user, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminUserDetailsPage;
