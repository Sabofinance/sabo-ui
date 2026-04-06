import { apiRequest } from "./request";

export const adminApi = {
  // Dashboard & Analytics
  getDashboard: () => apiRequest.get("/admin/dashboard"),
  getAnalyticsImpact: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/analytics/impact", params),
  getAnalyticsMetrics: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/analytics/metrics", params),

  // Users
  listUsers: (params?: Record<string, unknown>) => apiRequest.get("/admin/users", params),
  getUserById: (id: string) => apiRequest.get(`/admin/users/${id}`),
  suspendUser: (id: string) => apiRequest.post(`/admin/users/${id}/suspend`),
  reinstateUser: (id: string) => apiRequest.post(`/admin/users/${id}/reinstate`),

  // KYC
  listKyc: (params?: Record<string, unknown>) => apiRequest.get("/admin/kyc", params),
  approveKyc: (id: string) => apiRequest.post(`/admin/kyc/${id}/approve`),
  rejectKyc: (id: string, reason: string) =>
    apiRequest.post(`/admin/kyc/${id}/reject`, { reason }),

  // Deposits
  listDeposits: (params?: Record<string, unknown>) => apiRequest.get("/admin/deposits", params),
  approveDeposit: (id: string) => apiRequest.post(`/admin/deposits/${id}/approve`),
  rejectDeposit: (id: string, reason: string) =>
    apiRequest.post(`/admin/deposits/${id}/reject`, { reason }),
  verifyFlutterwave: (id: string) =>
    apiRequest.post(`/admin/deposits/${id}/verify-flutterwave`),

  // Disputes
  listDisputes: (params?: Record<string, unknown>) => apiRequest.get("/admin/disputes", params),
  resolveDispute: (id: string, resolution_note: string) =>
    apiRequest.post(`/admin/disputes/${id}/resolve`, { resolution_note }),

  // Trades & Transactions
  listTrades: (params?: Record<string, unknown>) => apiRequest.get("/admin/trades", params),
  listTransactions: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/transactions", params),

  // Logs
  listLogs: (params?: Record<string, unknown>) => apiRequest.get("/admin/logs", params),

  // Profile
  getProfile: () => apiRequest.get("/admin/profile"),
  updateProfilePicture: (formData: FormData) =>
    apiRequest.post("/admin/profile/picture", formData, {
      headers: { "Content-Type": undefined },
    }),

  // Super-admin governance
  listAdmins: (params?: Record<string, unknown>) => apiRequest.get("/admin/admins", params),
  createInvite: (email: string, name: string) =>
    apiRequest.post("/admin/invites", { email, name }),
  acceptInvite: (token: string) => apiRequest.get("/admin/invites/accept", { token }),
  setupInvite: (payload: Record<string, unknown>) =>
    apiRequest.post("/admin/invites/setup", payload),
  removeAdmin: (id: string) => apiRequest.post(`/admin/admins/${id}/remove`),
  upgradeAdmin: (id: string) => apiRequest.post(`/admin/admins/${id}/upgrade`),
};

export default adminApi;
