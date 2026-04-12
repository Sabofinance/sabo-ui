import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminApi } from "../../lib/api";

import {
  ArrowLeft,
  Mail,
  Shield,
  Wallet as WalletIcon,
  Activity,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Lock,
} from "lucide-react";

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
  username?: string;
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

const fmtCurrency = (amount: string | number, currency: string) => {
  try {
    const val = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency === "NGN" ? "NGN" : currency,
      minimumFractionDigits: 2,
    }).format(val || 0);
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
const StatusBadge: React.FC<{ suspended?: boolean }> = ({ suspended }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "800",
      background: suspended ? "#fef2f2" : "#ecfdf5",
      color: suspended ? "#ef4444" : "#10b981",
      textTransform: "uppercase",
    }}
  >
    {suspended ? <XCircle size={14} /> : <CheckCircle size={14} />}
    {suspended ? "Suspended" : "Active"}
  </div>
);

const KycBadge: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status || "unverified").toLowerCase();
  const configs: Record<string, any> = {
    verified: {
      bg: "#ecfdf5",
      color: "#10b981",
      icon: <CheckCircle size={14} />,
      label: "Verified",
    },
    pending: {
      bg: "#fffbeb",
      color: "#f59e0b",
      icon: <Clock size={14} />,
      label: "Pending",
    },
    rejected: {
      bg: "#fef2f2",
      color: "#ef4444",
      icon: <XCircle size={14} />,
      label: "Rejected",
    },
    unverified: {
      bg: "#f1f5f9",
      color: "#64748b",
      icon: <Shield size={14} />,
      label: "Unverified",
    },
  };
  const config = configs[s] || configs.unverified;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: "800",
        background: config.bg,
        color: config.color,
        textTransform: "uppercase",
      }}
    >
      {config.icon}
      {config.label}
    </div>
  );
};

const InfoCard: React.FC<{
  title: string;
  icon: any;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div
    style={{
      background: "#fff",
      padding: "24px",
      borderRadius: "24px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          background: "#f1f5f9",
          padding: "8px",
          borderRadius: "10px",
          color: "#0A1E28",
        }}
      >
        <Icon size={18} />
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: "800",
          color: "#0A1E28",
          fontFamily: "Bricolage Grotesque",
        }}
      >
        {title}
      </h3>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {children}
    </div>
  </div>
);

const DetailRow: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}> = ({ label, value, mono, copyable }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: "12px",
      borderBottom: "1px solid #f8fafc",
    }}
  >
    <div
      style={{
        fontSize: "12px",
        color: "#94a3b8",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "14px",
        color: "#0A1E28",
        fontWeight: "600",
        textAlign: "right",
        fontFamily: mono ? "monospace" : "inherit",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {value}
      {copyable && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "2px",
            borderRadius: "4px",
          }}
        >
          <Copy size={12} />
        </button>
      )}
    </div>
  </div>
);

/* ─── Page ───────────────────────────────────────────────── */
const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const fetchUser = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminApi.getUserById(id);
      if (res.success && res.data) {
        const payload = res.data as Record<string, unknown>;
        setUser((payload.user ?? payload) as UserRecord);
      } else {
        toast.error(res.error?.message || "User not found");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user || !id) return;
    const isSuspended = Boolean(user.is_suspended);
    if (
      !window.confirm(
        `Are you sure you want to ${isSuspended ? "reinstate" : "suspend"} this user?`,
      )
    )
      return;

    setActionLoading(true);
    try {
      const res = isSuspended
        ? await adminApi.reinstateUser(id)
        : await adminApi.suspendUser(id);
      if (res.success) {
        toast.success(
          `User ${isSuspended ? "reinstated" : "suspended"} successfully`,
        );
        void fetchUser();
      } else {
        toast.error(res.error?.message || "Action failed");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#94a3b8",
        }}
      >
        <RefreshCw size={24} className="animate-spin" />
      </div>
    );
  }

  const displayName =
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Unknown User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const wallets = Array.isArray(user.wallets) ? user.wallets : [];

  return (
    <main
      style={{
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: "32px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "#64748b",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "16px",
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back to Users
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "24px",
                background: "#0A1E28",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#C8F032",
                fontSize: "28px",
                fontWeight: "800",
                fontFamily: "Bricolage Grotesque",
                boxShadow: "0 10px 20px rgba(10,30,40,0.1)",
              }}
            >
              {initials}
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#0A1E28",
                  fontFamily: "Bricolage Grotesque",
                }}
              >
                {displayName}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  @{user.username || "no_username"}
                </span>
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "#e2e8f0",
                  }}
                />
                <StatusBadge suspended={Boolean(user.is_suspended)} />
                <KycBadge status={user.kyc_status as string} />
                <span
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    fontWeight: "500",
                  }}
                >
                  Joined{" "}
                  {new Date(
                    user.created_at || user.createdAt || Date.now(),
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              style={{
                padding: "12px 24px",
                borderRadius: "14px",
                fontWeight: "700",
                cursor: "pointer",
                background: user.is_suspended ? "#ecfdf5" : "#fef2f2",
                color: user.is_suspended ? "#10b981" : "#ef4444",
                border: `1px solid ${user.is_suspended ? "#10b981" : "#ef4444"}`,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {actionLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : user.is_suspended ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {user.is_suspended ? "Reinstate User" : "Suspend User"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section 2: Quick Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          <InfoCard title="KYC Compliance" icon={Shield}>
            <div style={{ padding: "8px 0" }}>
              <KycBadge status={user.kyc_status as string} />
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                Identity verification is required for high-volume transactions
                and advanced platform features.
              </div>
            </div>
          </InfoCard>
          <InfoCard title="Account Security" icon={Lock}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <DetailRow
                label="Email Verified"
                value={user.email_verified ? "Verified" : "Unverified"}
              />
              <DetailRow
                label="Phone Verified"
                value={user.phone_verified ? "Verified" : "Unverified"}
              />
            </div>
          </InfoCard>
          <InfoCard title="Platform Role" icon={Shield}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <DetailRow
                label="Access Level"
                value={String(user.role || "user")}
              />
              <DetailRow label="Permissions" value="Standard User" />
            </div>
          </InfoCard>
        </div>

        {/* Section 3: Contact & Technical Data (Side-by-Side) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <InfoCard title="Contact Details" icon={Mail}>
            <DetailRow label="Primary Email" value={user.email} copyable />
            <DetailRow
              label="Phone Number"
              value={String(user.phone || user.phoneNumber || "—")}
              copyable
            />
          </InfoCard>
          <InfoCard title="Technical Metadata" icon={RefreshCw}>
            <DetailRow label="User ID" value={user.id} mono copyable />
            <DetailRow
              label="Created At"
              value={fmtDate(user.created_at || user.createdAt)}
            />
            <button
              onClick={() => setShowRaw(!showRaw)}
              style={{
                marginTop: "12px",
                background: "none",
                border: "none",
                color: "#3b82f6",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
              }}
            >
              {showRaw ? "Hide" : "View"} Developer JSON
            </button>
          </InfoCard>
        </div>

        {/* Section 4: Financial Assets (2x2 Grid) */}
        <div
          style={{
            background: "#0A1E28",
            padding: "32px",
            borderRadius: "32px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle at top right, rgba(200, 240, 50, 0.1), transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                background: "rgba(200, 240, 50, 0.2)",
                padding: "10px",
                borderRadius: "12px",
              }}
            >
              <WalletIcon size={20} color="#C8F032" />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "800",
                fontFamily: "Bricolage Grotesque",
              }}
            >
              Financial Assets
            </h3>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {wallets.length > 0 ? (
              wallets.map((w) => (
                <div
                  key={w.id}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "24px",
                    borderRadius: "24px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#94A3B8",
                        textTransform: "uppercase",
                      }}
                    >
                      {w.currency}
                    </span>
                    <span style={{ fontSize: "24px" }}>
                      {currencyFlag[w.currency] || "💳"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "white",
                      marginBottom: "16px",
                      fontFamily: "monospace",
                    }}
                  >
                    {fmtCurrency(w.balance, w.currency)}
                  </div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        Locked
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>
                        {fmtCurrency(w.locked_balance, w.currency)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        Escrow
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>
                        {fmtCurrency(w.escrow_balance, w.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#94a3b8" }}>No active wallets.</div>
            )}
          </div>
        </div>

        {/* Section 5: Recent Activity Logs (Full Width) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InfoCard title="Recent Activity Logs" icon={Activity}>
            <div
              style={{
                textAlign: "center",
                padding: "64px 24px",
                color: "#94a3b8",
              }}
            >
              <Clock
                size={40}
                style={{ margin: "0 auto 16px", opacity: 0.2 }}
              />
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0A1E28",
                  marginBottom: "4px",
                }}
              >
                No Activity Yet
              </div>
              <p style={{ fontSize: "14px", margin: 0 }}>
                All transaction history and system logs will appear in this
                section.
              </p>
            </div>
          </InfoCard>

          {/* Raw JSON Preview */}
          {showRaw && (
            <pre
              style={{
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "16px",
                fontSize: "11px",
                overflowX: "auto",
                border: "1px solid #e2e8f0",
              }}
            >
              {JSON.stringify(user, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminUserDetailsPage;
