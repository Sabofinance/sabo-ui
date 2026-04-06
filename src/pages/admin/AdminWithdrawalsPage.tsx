import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { adminApi } from "../../lib/api";
import { extractArray } from "../../lib/api/response";
import Pagination from "../../components/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpCircle,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Loader2,
} from "lucide-react";

interface WithdrawalRecord {
  id: string | number;
  reference?: string;
  user_name?: string;
  user_email?: string;
  user?: { name?: string; email?: string };
  amount?: number | string;
  currency?: string;
  status?: string;
  created_at?: string | number;
  createdAt?: string | number;
  [key: string]: any;
}

const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRecord | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvingId, setApprovingId] = useState<string | number | null>(null);
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listWithdrawals({ page: currentPage, limit });
      if (res.success) {
        const data = res.data as any;
        const list =
          data.items || data.transactions || extractArray(res.data) || [];
        setWithdrawals(Array.isArray(list) ? list : []);
        const meta = data.meta || data || {};
        setTotal(
          meta.total || meta.totalCount || meta.total_count || list.length || 0,
        );
      } else {
        toast.error(res.error?.message || "Could not load withdrawals");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    void loadWithdrawals();
  }, [loadWithdrawals]);

  const getStatusColor = (status: string = "pending") => {
    const s = String(status).toLowerCase();
    if (s === "completed" || s === "success")
      return {
        bg: "#ecfdf5",
        text: "#10b981",
        icon: <CheckCircle size={14} />,
      };
    if (s === "failed" || s === "rejected")
      return { bg: "#fef2f2", text: "#ef4444", icon: <XCircle size={14} /> };
    return { bg: "#fffbeb", text: "#f59e0b", icon: <Clock size={14} /> };
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const email = String(w.user_email || w.user?.email || "").toLowerCase();
    const name = String(w.user_name || w.user?.name || "").toLowerCase();
    const ref = String(w.reference || w.id || "").toLowerCase();
    return email.includes(term) || name.includes(term) || ref.includes(term);
  });

  // Approve
  const handleApprove = async () => {
    if (!selectedWithdrawal?.id) return;
    const id = selectedWithdrawal.id;
    setApprovingId(id);

    try {
      const res = await adminApi.approveWithdrawal(String(id));

      if (res.success) {
        toast.success("Withdrawal approved successfully");
        setSelectedWithdrawal(null);
        void loadWithdrawals();
      } else {
        toast.error(res.error?.message || "Failed to approve withdrawal");
      }
    } catch (err: any) {
      toast.error(err.message || "Error approving withdrawal");
    } finally {
      setApprovingId(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = () => {
    setRejectReason("");
    setShowRejectModal(true);
  };

  // Submit Rejection
  const handleRejectSubmit = async () => {
    if (!selectedWithdrawal?.id || !rejectReason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }

    const id = selectedWithdrawal.id;
    setRejectingId(id);
    setShowRejectModal(false);

    try {
      const res = await adminApi.rejectWithdrawal(
        String(id),
        rejectReason.trim(),
      );

      if (res.success) {
        toast.success("Withdrawal rejected and funds refunded");
        setSelectedWithdrawal(null);
        void loadWithdrawals();
      } else {
        toast.error(res.error?.message || "Failed to reject withdrawal");
      }
    } catch (err: any) {
      toast.error(err.message || "Error rejecting withdrawal");
    } finally {
      setRejectingId(null);
      setRejectReason("");
    }
  };

  return (
    <main
      style={{
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* Header */}
      <div
        style={{
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                background: "#0A1E28",
                padding: "10px",
                borderRadius: "12px",
                color: "#C8F032",
              }}
            >
              <ArrowUpCircle size={24} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "800",
                fontFamily: "Bricolage Grotesque",
                color: "#0A1E28",
              }}
            >
              Withdrawals
            </h1>
          </div>
          <p
            style={{
              color: "#64748b",
              margin: 0,
              fontSize: "15px",
              fontWeight: "500",
            }}
          >
            Review and manage user withdrawal requests.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
              size={18}
            />
            <input
              type="text"
              placeholder="Search by user, email or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "12px 40px 12px 40px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                outline: "none",
                width: "320px",
                fontSize: "14px",
              }}
            />
          </div>
          <button
            onClick={() => void loadWithdrawals()}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#0A1E28",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          overflowX: "auto",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "800px",
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: "left",
                background: "#f8fafc",
                borderBottom: "2px solid #f1f5f9",
              }}
            >
              <th
                style={{
                  padding: "20px 24px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                User
              </th>
              <th
                style={{
                  padding: "20px 24px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                Amount
              </th>
              <th
                style={{
                  padding: "20px 24px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                Currency
              </th>
              <th
                style={{
                  padding: "20px 24px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "20px 24px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "20px 24px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                  textAlign: "right",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && withdrawals.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "80px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Loading withdrawals...
                </td>
              </tr>
            ) : filteredWithdrawals.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "80px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  {searchTerm
                    ? "No matching withdrawals found."
                    : "No withdrawals found."}
                </td>
              </tr>
            ) : (
              filteredWithdrawals.map((w) => {
                const statusStyle = getStatusColor(w.status);
                const userName = String(w.user_name || w.user?.name || "N/A");
                const userEmail = String(w.user_email || w.user?.email || "-");
                const amount = Number(w.amount || 0);
                const currency = String(w.currency || "NGN");
                const date = w.created_at || w.createdAt;

                return (
                  <tr key={w.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "20px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                          }}
                        >
                          {userName[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700" }}>{userName}</div>
                          <div style={{ fontSize: "13px", color: "#64748b" }}>
                            {userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "20px 24px", fontWeight: "800" }}>
                      {new Intl.NumberFormat("en-NG").format(amount)}
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          background: "#f4f6f9",
                          borderRadius: 6,
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {currency}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: "800",
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {statusStyle.icon} {w.status || "pending"}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px", color: "#64748b" }}>
                      {date
                        ? new Date(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td style={{ padding: "20px 24px", textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedWithdrawal(w)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#fff",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={16} style={{ marginRight: "6px" }} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "28px" }}>
        <Pagination
          currentPage={currentPage}
          total={total}
          limit={limit}
          onPageChange={setCurrentPage}
          isLoading={loading}
        />
      </div>

      {/* Withdrawal Details Modal */}
      <AnimatePresence>
        {selectedWithdrawal && !showRejectModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWithdrawal(null)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(10, 30, 40, 0.65)",
                backdropFilter: "blur(6px)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "520px",
                background: "#fff",
                borderRadius: "32px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  padding: "24px 32px",
                  borderBottom: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "21px",
                    fontWeight: "800",
                    fontFamily: "Bricolage Grotesque",
                  }}
                >
                  Withdrawal Details
                </h2>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                  }}
                >
                  <X size={26} />
                </button>
              </div>

              <div style={{ padding: "32px" }}>
                <div style={{ display: "grid", gap: "22px", fontSize: "15px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#64748b" }}>Reference</span>
                    <span style={{ fontWeight: "700" }}>
                      #{selectedWithdrawal.reference || selectedWithdrawal.id}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#64748b" }}>User</span>
                    <span style={{ fontWeight: "700" }}>
                      {selectedWithdrawal.user_name ||
                        selectedWithdrawal.user?.name ||
                        "N/A"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#64748b" }}>Amount</span>
                    <span style={{ fontWeight: "800" }}>
                      {selectedWithdrawal.currency || "NGN"}{" "}
                      {new Intl.NumberFormat("en-NG").format(
                        Number(selectedWithdrawal.amount || 0),
                      )}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#64748b" }}>Status</span>
                    <span
                      style={{ fontWeight: "700", textTransform: "uppercase" }}
                    >
                      {selectedWithdrawal.status}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "24px 32px",
                  borderTop: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleApprove}
                  disabled={!!approvingId || !!rejectingId}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    background: "#0A1E28",
                    color: "#C8F032",
                    border: "none",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {approvingId === selectedWithdrawal.id ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />{" "}
                      Approving...
                    </>
                  ) : (
                    "Approve Withdrawal"
                  )}
                </button>

                <button
                  onClick={openRejectModal}
                  disabled={!!approvingId || !!rejectingId}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    background: "#fff",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                    fontWeight: "700",
                  }}
                >
                  Reject Withdrawal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {showRejectModal && selectedWithdrawal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(10, 30, 40, 0.7)",
                backdropFilter: "blur(8px)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "460px",
                background: "#fff",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#0A1E28",
                }}
              >
                Reject Withdrawal
              </h3>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                Please provide a clear reason for rejecting this withdrawal.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (e.g. Invalid account details, Suspicious activity, etc.)"
                style={{
                  width: "100%",
                  minHeight: "140px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "15px",
                  resize: "vertical",
                  outline: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim() || !!rejectingId}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {rejectingId ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />{" "}
                      Rejecting...
                    </>
                  ) : (
                    "Reject Withdrawal"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminWithdrawalsPage;
