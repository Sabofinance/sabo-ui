import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  ShieldOff,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Layers,
  CheckCircle2,
  BarChart3,
  Activity,
  AlertTriangle,
  Clock,
  XCircle,
  Lock,
  ArrowRight,
  FileText,
  Inbox,
  X,
  Eye,
} from "lucide-react";
import tradesApi from "../../lib/api/trades.api";
import { extractArray } from "../../lib/api/response";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import PinDotsInput from "../../components/PinDotsInput";
import Pagination from "../../components/Pagination";

import { useMemo, useCallback } from "react";


type TradeStatus =
  | "initiated"
  | "escrowed"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "disputed";

interface Trade {
  id: string;
  type: "buy" | "sell";
  currency: string;
  amount: number;
  rate: number;
  total: number;
  status: TradeStatus;
  createdAt: string;
  counterparty: { name: string; avatar: string };
  reference?: string;
  seller_id?: string;
}

/* ── Design tokens ── */
const tk = {
  primary: "#C8F032",
  primaryDark: "#A8CC10",
  dark: "#0A1E28",
  bgBase: "#FFFFFF",
  bgSection: "#F8F9FA",
  bgMuted: "#F3F4F6",
  textPrimary: "#FFFFFF",
  textBody: "#374151",
  textMuted: "#9CA3AF",
  textLight: "#CBD5E1",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#06B6D4",
};

/* ── Avatar util ── */
const AVATAR_COLORS = ["#0A1E28", "#1a3a4a", "#2C3E35", "#1d3d2e", "#3b5268"];

function avatarBg(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ── Status config ── */
const STATUS: Record<
  TradeStatus,
  {
    label: string;
    bg: string;
    color: string;
    borderColor: string;
    Icon: React.FC<any>;
  }
> = {
  initiated: {
    label: "Initiated",
    bg: "#EFF6FF",
    color: "#2563EB",
    borderColor: "#BFDBFE",
    Icon: Clock,
  },
  escrowed: {
    label: "Escrowed",
    bg: "#FFFBEB",
    color: "#D97706",
    borderColor: "#FEF3C7",
    Icon: Lock,
  },
  confirmed: {
    label: "Confirmed",
    bg: "#ECFDF5",
    color: "#059669",
    borderColor: "#D1FAE5",
    Icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    bg: "#F0FDF4",
    color: "#16A34A",
    borderColor: "#DCFCE7",
    Icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    bg: "#FEF2F2",
    color: "#DC2626",
    borderColor: "#FEE2E2",
    Icon: XCircle,
  },
  disputed: {
    label: "Disputed",
    bg: "#FFF7ED",
    color: "#EA580C",
    borderColor: "#FFEDD5",
    Icon: AlertTriangle,
  },
};

/* ── StatusBadge ── */
const StatusBadge: React.FC<{ status: TradeStatus }> = ({ status }) => {
  const cfg = STATUS[status];
  const Icon = cfg.Icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px 4px 7px",
        borderRadius: 6,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.borderColor}`,
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: "0.2px",
        whiteSpace: "nowrap" as const,
      }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
};

/* ── StatCard ── */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  color?: "blue" | "green" | "amber" | "lime";
  Icon: React.FC<any>;
  sub?: string;
}> = ({ label, value, color, Icon, sub }) => {
  const colors = {
    blue: { bg: "#0A1E28", text: "#3A7BFF" },
    green: { bg: "#0A1E28", text: "#10B981" },
    amber: { bg: "#0A1E28", text: "#F59E0B" },
    lime: { bg: "#0A1E28", text: "#A8CC10" },
    default: { bg: tk.bgSection, text: tk.textMuted },
  };

  const theme = color ? colors[color] : colors.default;

  return (
    <div
      style={{
        background: theme.bg,
        border: `1.5px solid ${color === 'lime' ? 'rgba(200, 240, 50, 0.3)' : tk.border}`,
        borderRadius: 14,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.7px",
            textTransform: "uppercase" as const,
            color: color === 'lime' ? "#698F00" : tk.textMuted,
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: color === 'lime' ? "rgba(200, 240, 50, 0.25)" : theme.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.text,
          }}
        >
          <Icon size={15} strokeWidth={2.5} />
        </div>
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: tk.textPrimary,
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11,
            color: color === 'lime' ? "#7B8C74" : tk.textMuted,
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

/* ── Trade Detail Modal ── */
const TradeDetailModal: React.FC<{
  trade: Trade | null;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ trade, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);

  if (!trade) return null;

  const isSeller = user?.id === trade.seller_id;
  const canAccept = isSeller && (trade.status === "initiated" || trade.status === "escrowed");

  const handleAccept = async () => {
    if (!pin || pin.length < 6) {
      toast.error("Please enter your 6-digit transaction PIN.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await tradesApi.sellerConfirm(trade.id, { pin });
      if (res.success) {
        toast.success("Trade accepted and confirmed!");
        onSuccess?.();
        onClose();
        navigate(`/dashboard/trade/${trade.id}`);
      } else {
        toast.error(res.error?.message || "Failed to accept trade.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0A1E28", // Dark background
          borderRadius: 20,
          width: "92%",
          maxWidth: 520,
          maxHeight: "92vh",
          overflow: "auto",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.6)",
          border: `1.5px solid #1F2E3A`, // Darker border
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid #1F2E3A`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 19,
              fontWeight: 800,
              color: "#F1F5F9", // Light text
            }}
          >
            Trade Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8", // Muted light color
            }}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "28px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {trade.counterparty.avatar ? (
              <img
                src={trade.counterparty.avatar}
                alt=""
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `3px solid #1F2E3A`,
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: avatarBg(trade.counterparty.name),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: tk.primary, // Keep bright primary
                  border: `3px solid rgba(200,240,50,0.3)`,
                }}
              >
                {initials(trade.counterparty.name)}
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#F1F5F9", // Light text
                }}
              >
                {trade.counterparty.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#64748B", // Dark mode muted
                  fontFamily: "monospace",
                }}
              >
                #{trade.id.slice(0, 8)}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <StatusBadge status={trade.status} />
          </div>

          <div
            style={{
              background: "#1A2834", // Slightly lighter dark card
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
              border: `1px solid #253544`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 14 }}>Type</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 700,
                  color: trade.type === "buy" ? "#34D399" : "#FB7185",
                }}
              >
                {trade.type === "buy" ? (
                  <ArrowDownLeft size={18} />
                ) : (
                  <ArrowUpRight size={18} />
                )}
                {trade.type.toUpperCase()}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 14 }}>Amount</span>
              <span style={{ fontWeight: 700, fontSize: 17, color: "#F1F5F9" }}>
                {trade.amount.toLocaleString()} {trade.currency}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 14 }}>Rate</span>
              <span style={{ color: "#CBD5E1" }}>
                ₦{trade.rate.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: `1px solid #253544`,
                paddingTop: 14,
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 14 }}>
                Total (NGN)
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 19,
                  color: tk.primary, // Keep your signature lime green
                }}
              >
                ₦{trade.total.toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          <div style={{ fontSize: 13.5, color: "#64748B", marginBottom: 28 }}>
            Created on{" "}
            {new Date(trade.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Accept & Continue Section */}
          {canAccept && !showPinEntry && (
            <button
              onClick={() => setShowPinEntry(true)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                background: tk.primary,
                color: tk.dark,
                fontSize: "15px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s",
                boxShadow: "0 8px 24px rgba(200, 240, 50, 0.25)",
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = "translateY(-2px)";
                b.style.boxShadow = "0 12px 30px rgba(200, 240, 50, 0.35)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = "translateY(0)";
                b.style.boxShadow = "0 8px 24px rgba(200, 240, 50, 0.25)";
              }}
            >
              Accept & Continue
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          )}

          {canAccept && showPinEntry && (
            <div
              style={{
                background: "#1A2834",
                borderRadius: 14,
                padding: 20,
                border: `1px solid ${tk.primary}40`,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#F1F5F9",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Enter PIN to Authorize
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <PinDotsInput value={pin} onChange={setPin} autoFocus />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowPinEntry(false)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: `1.5px solid #253544`,
                    background: "transparent",
                    color: "#94A3B8",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={submitting || pin.length < 6}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: tk.primary,
                    color: tk.dark,
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    opacity: submitting || pin.length < 6 ? 0.6 : 1,
                  }}
                >
                  {submitting ? "Processing..." : "Confirm & Accept"}
                </button>
              </div>
            </div>
          )}

          {/* If past trade or not seller, just a button to view full page */}
          {!canAccept && (
            <button
              onClick={() => {
                onClose();
                const nav = useNavigate();
                nav(`/dashboard/trade/${trade.id}`);
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: `1.5px solid #253544`,
                background: "transparent",
                color: "#F1F5F9",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "#1F2E3A";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "transparent";
              }}
            >
              View Full Details
              <Eye size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const TradesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const kycStatus = String((user as any)?.kyc_status || "").toLowerCase();
 
  const isVerified = kycStatus === "verified";
 console.log("verif"  ,isVerified);
  const loadTrades = async (page = 1) => {
    setLoading(true);
    setRefreshing(true);
    setError("");
    try {
      const res = await tradesApi.list({ page, limit: 10 });
      if (res.success) {
        const data = extractArray(res.data);
        const mapped: Trade[] = data.map((item: any) => {
          const status = String(
            item.status || item.state || "initiated",
          ).toLowerCase() as TradeStatus;
          const type =
            String(item.type || item.side || "buy").toLowerCase() === "sell"
              ? "sell"
              : "buy";
          const amount = Number(item.amount || item.bid_amount || 0);
          const rate = Number(item.rate || item.rate_ngn || 0);
          const total = Number(
            item.total_ngn || item.total || item.value || amount * rate,
          );

          return {
            id: String(item.id || item.tradeId),
            type,
            currency: String(item.currency || "NGN"),
            amount,
            rate,
            total,
            status,
            createdAt: String(
              item.created_at || item.createdAt || new Date().toISOString(),
            ),
            seller_id: String(item.seller_id || item.sellerId || ""),
            counterparty: {
              name: String(
                item.buyer_name ||
                  item.seller_name ||
                  item.counterpartyName ||
                  item.counterparty?.name ||
                  "Trader",
              ),
              avatar: String(
                item.counterpartyAvatar ||
                  item.counterparty?.avatar ||
                  item.buyer_avatar ||
                  item.seller_avatar ||
                  "",
              ),
            },
            reference: item.reference,
          };
        });
        setTrades(mapped);
        const meta = (res.data as any)?.meta || (res.data as any);
        setTotalPages(meta.totalPages || meta.last_page || 1);
        setCurrentPage(page);
      } else {
        setError(res.error?.message || "Failed to load trades.");
      }
    } catch (e: any) {
      setError(e?.message || "An error occurred.");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    if (isVerified) void loadTrades(currentPage);
  }, [isVerified]);

  const isActiveTrade = (tr: Trade) =>
    ["initiated", "escrowed", "confirmed", "disputed"].includes(tr.status);

  const filteredTrades = trades.filter((tr) =>
    activeTab === "active" ? isActiveTrade(tr) : !isActiveTrade(tr),
  );

  const activeTrades = trades.filter(isActiveTrade);
  const totalVolume = trades.reduce((acc, tr) => acc + tr.total, 0);
  const completedCount = trades.filter(
    (tr) => tr.status === "completed",
  ).length;

  /* ── KYC Gate ── */
  if (!isVerified) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: tk.bgBase,
          padding: "48px 32px",
          fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: tk.textPrimary,
              margin: "0 0 32px",
              letterSpacing: "-0.5px",
            }}
          >
            My Trades
          </h1>
          <div
            style={{
              background: tk.bgBase,
              border: `1.5px solid ${tk.border}`,
              borderRadius: 18,
              padding: "40px 36px",
              maxWidth: 460,
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: tk.dark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <ShieldOff size={22} color={tk.primary} strokeWidth={1.8} />
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: tk.textPrimary,
                marginBottom: 8,
                letterSpacing: "-0.3px",
              }}
            >
              KYC Verification Required
            </div>
            <div style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.7 }}>
              Complete your identity verification to start trading and view your
              full trade history.
            </div>
            <button
              onClick={() => navigate("/dashboard/kyc")}
              style={{
                marginTop: 24,
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                background: tk.dark,
                color: "#ffffff",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                letterSpacing: "0.2px",
              }}
            >
              Complete KYC
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ── Main Page ── */
  return (
    <main
      style={{
        minHeight: "100vh",
        background: tk.bgBase,
        padding: "40px 32px 80px",
        fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: tk.textPrimary,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              My Trades
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: "#0A1E28",
                margin: "5px 0 0",
                fontWeight: 400,
              }}
            >
              Track and manage your active and past trades
            </p>
          </div>
          <button
            onClick={() => void loadTrades()}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: `1.5px solid ${tk.border}`,
              background: "#0A1E28",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                tk.dark;
              (e.currentTarget as HTMLButtonElement).style.color = tk.dark;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                tk.border;
              (e.currentTarget as HTMLButtonElement).style.color = tk.textBody;
            }}
          >
            <RefreshCw
              size={13}
              strokeWidth={2.2}
              style={{
                transition: "transform 0.5s",
                transform: refreshing ? "rotate(360deg)" : "rotate(0deg)",
              }}
            />
            Refresh
          </button>
        </div>

        {/* ── Stats Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <StatCard
            label="Active Trades"
            value={activeTrades.length}
            color="lime"
            Icon={Activity}
            sub="Currently open"
          />
          <StatCard
            label="Completed"
            value={completedCount}
            color="lime"
            Icon={CheckCircle2}
            sub="Successful"
          />
          <StatCard
            label="Total Trades"
            value={trades.length}
            color="lime"
            Icon={Layers}
            sub="All time"
          />
          <StatCard
            label="Volume (NGN)"
            value={`₦${totalVolume.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`}
            color="lime"
            Icon={BarChart3}
            sub="Total traded"
          />
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            background: tk.bgSection,
            border: `1.5px solid ${tk.border}`,
            borderRadius: 11,
            padding: 4,
            width: "fit-content",
          }}
        >
          {(["active", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.15s",
                background: activeTab === tab ? tk.dark : "transparent",
                color: activeTab === tab ? tk.primary : tk.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {tab === "active" ? "Active Trades" : "Past Trades"}
              {tab === "active" && activeTrades.length > 0 && (
                <span
                  style={{
                    background: activeTab === "active" ? tk.primary : tk.border,
                    color: activeTab === "active" ? tk.dark : tk.textMuted,
                    borderRadius: 6,
                    fontSize: 10,
                    padding: "1px 6px",
                    fontWeight: 800,
                    lineHeight: "16px",
                  }}
                >
                  {activeTrades.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "#FEF2F2",
              border: "1.5px solid #FECACA",
              borderRadius: 10,
              color: tk.error,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle size={14} strokeWidth={2} />
            {error}
          </div>
        )}

        {/* ── Updated Table ── */}
        <div
          style={{
            background: tk.bgBase,
            borderRadius: 16,
            border: `1.5px solid ${tk.border}`,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "52px 1fr 90px 170px 140px 120px 90px",
              gap: 12,
              padding: "14px 24px",
              background: tk.bgSection,
              borderBottom: `1.5px solid ${tk.border}`,
            }}
          >
            {["", "Counterparty", "Type", "Amount", "Status", "Date", ""].map(
              (col, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: tk.textMuted,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.7px",
                  }}
                >
                  {col}
                </div>
              ),
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ padding: "64px 20px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", gap: 6, marginBottom: 16 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: tk.primary,
                      animation: `pulse 1.1s ${i * 0.18}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 13, color: tk.textMuted }}>
                Loading trades…
              </div>
            </div>
          ) : filteredTrades.length === 0 ? (
            /* Empty state */
            <div style={{ padding: "72px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: tk.bgSection,
                  border: `1.5px solid ${tk.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: tk.textLight,
                }}
              >
                {activeTab === "active" ? (
                  <Inbox size={24} strokeWidth={1.5} />
                ) : (
                  <FileText size={24} strokeWidth={1.5} />
                )}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: tk.textPrimary,
                  fontSize: 15,
                  marginBottom: 6,
                }}
              >
                {activeTab === "active" ? "No active trades" : "No past trades"}
              </div>
              <div style={{ fontSize: 13, color: tk.textMuted }}>
                {activeTab === "active"
                  ? "Your in-progress trades will appear here."
                  : "Completed and cancelled trades will show here."}
              </div>
            </div>
          ) : (
            /* Trade Rows - Updated Design */
            filteredTrades.map((tr, i) => (
              <div
                key={tr.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "52px 1fr 90px 170px 140px 120px 90px",
                  gap: 12,
                  alignItems: "center",
                  padding: "16px 24px",
                  background: tk.bgBase,
                  borderBottom:
                    i < filteredTrades.length - 1
                      ? `1px solid ${tk.border}`
                      : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F9FAF2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = tk.bgBase)
                }
              >
                {/* Avatar */}
                {tr.counterparty.avatar ? (
                  <img
                    src={tr.counterparty.avatar}
                    alt=""
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `2px solid ${tk.border}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: avatarBg(tr.counterparty.name),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      color: tk.primary,
                      border: `2px solid rgba(200,240,50,0.2)`,
                    }}
                  >
                    {initials(tr.counterparty.name)}
                  </div>
                )}

                {/* Counterparty */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tr.counterparty.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: tk.textLight,
                      marginTop: 1,
                      fontFamily: "monospace",
                    }}
                  >
                    #{tr.id.slice(0, 8)}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 9px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.4px",
                      background: tr.type === "buy" ? "#ECFDF5" : "#FFF7F5",
                      color: tr.type === "buy" ? "#059669" : "#DC4E2A",
                      border: `1px solid ${tr.type === "buy" ? "#A7F3D0" : "#FDDDD6"}`,
                    }}
                  >
                    {tr.type === "buy" ? (
                      <ArrowDownLeft size={11} strokeWidth={2.5} />
                    ) : (
                      <ArrowUpRight size={11} strokeWidth={2.5} />
                    )}
                    {tr.type.toUpperCase()}
                  </span>
                </div>

                {/* Amount */}
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: tk.textPrimary,
                    }}
                  >
                    {tr.amount.toLocaleString()} {tr.currency}
                  </div>
                  {tr.rate > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: tk.textMuted,
                        marginTop: 2,
                      }}
                    >
                      @ ₦{tr.rate.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={tr.status} />
                </div>

                {/* Date */}
                <div
                  style={{
                    fontSize: 12.5,
                    color: tk.textMuted,
                    fontWeight: 500,
                  }}
                >
                  {new Date(tr.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                {/* View Button - Now opens modal */}
                <div>
                  <button
                    onClick={() => setSelectedTrade(tr)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: `1.5px solid ${tk.border}`,
                      background: tk.bgBase,
                      color: tk.textBody,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.14s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                    onMouseEnter={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = tk.dark;
                      b.style.color = tk.primary;
                      b.style.borderColor = tk.dark;
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = tk.bgBase;
                      b.style.color = tk.textBody;
                      b.style.borderColor = tk.border;
                    }}
                  >
                    View
                    <Eye size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          total={totalPages}
          onPageChange={(p) => void loadTrades(p)}
          isLoading={loading}
          limit={10}
        />
         
      </div>

      {/* Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onSuccess={() => void loadTrades()}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </main>
  );
};

export default TradesPage;
