import type { AxiosRequestConfig } from "axios";
import { apiRequest } from "./request";

export const adminApi = {
  // Dashboard & Analytics
  getDashboard: () => apiRequest.get("/admin/dashboard"),
  getAnalyticsImpact: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/analytics/impact", params),
  getAnalyticsMetrics: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/analytics/metrics", params),

  // Users
  listUsers: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/users", params),
  getUserById: (id: string) => apiRequest.get(`/admin/users/${id}`),
  suspendUser: (id: string) => apiRequest.post(`/admin/users/${id}/suspend`),
  reinstateUser: (id: string) =>
    apiRequest.post(`/admin/users/${id}/reinstate`),

  // KYC
  listKyc: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/kyc", params),
  approveKyc: (id: string) => apiRequest.post(`/admin/kyc/${id}/approve`),
  rejectKyc: (id: string, reason: string) =>
    apiRequest.post(`/admin/kyc/${id}/reject`, { reason }),

  // Deposits
  listDeposits: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/deposits", params),
  approveDeposit: (id: string) =>
    apiRequest.post(`/admin/deposits/${id}/approve`),
  rejectDeposit: (id: string, reason: string) =>
    apiRequest.post(`/admin/deposits/${id}/reject`, { reason }),
  verifyFlutterwave: (id: string) =>
    apiRequest.post(`/admin/deposits/${id}/verify-flutterwave`),

  // Disputes
  listDisputes: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/disputes", params),
  resolveDispute: (id: string, resolution_note: string) =>
    apiRequest.post(`/admin/disputes/${id}/resolve`, { resolution_note }),

  // Trades & Transactions
  listTrades: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/trades", params),
  listTransactions: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/transactions", params),

  listWithdrawals: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/withdrawals", params),

  // Company rates management
  listCompanyRates: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/company-rates", params),
  getCompanyRate: (currency: string) =>
    apiRequest.get(`/admin/company-rates/${encodeURIComponent(currency)}`),
  saveCompanyRate: (payload: { currency: string; rate_ngn: string }) =>
    apiRequest.post("/admin/company-rates", payload),

  // Correct version based on official documentation
  approveWithdrawal: (id: string) =>
    apiRequest.post(`/admin/withdrawals/${id}/approve`), // No body

  rejectWithdrawal: (id: string, reason: string) =>
    apiRequest.post(`/admin/withdrawals/${id}/reject`, { reason }), // Use "reason" not "resolution_note"
  // Logs
  listLogs: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/logs", params),

  // Profile
  getProfile: () => apiRequest.get("/admin/profile"),
  updateProfilePicture: (formData: FormData, config?: AxiosRequestConfig) =>
    apiRequest.post("/admin/profile/picture", formData, {
      ...config,
      headers: { ...config?.headers, "Content-Type": undefined },
    }),

  // Super-admin governance
  listAdmins: (params?: Record<string, unknown>) =>
    apiRequest.get("/admin/admins", params),
  createInvite: (payload: Record<string, unknown>) =>
    apiRequest.post("/admin/invites", payload),
  acceptInvite: (token: string) =>
    apiRequest.get("/admin/invites/accept", { token }),
  setupInvite: (payload: Record<string, unknown>) =>
    apiRequest.post("/admin/invites/setup", payload),
  removeAdmin: (id: string) => apiRequest.post(`/admin/admins/${id}/remove`),
  upgradeAdmin: (id: string) => apiRequest.post(`/admin/admins/${id}/upgrade`),
};

export default adminApi;
