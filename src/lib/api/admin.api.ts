import { apiRequest } from "./request";

export const adminApi = {
  // Admin dashboard
  getDashboard: () => apiRequest.get("/admin/dashboard"),
  getAnalyticsImpact: () => apiRequest.get("/admin/analytics/impact"),

  // Users
  listUsers: (params?: Record<string, unknown>) => apiRequest.get("/admin/users", params),
  getUserById: (id: string) => apiRequest.get(`/admin/users/${id}`),
  suspendUser: (id: string) => apiRequest.post(`/admin/users/${id}/suspend`),
  reinstateUser: (id: string) => apiRequest.post(`/admin/users/${id}/reinstate`),

  // KYC
  listKyc: (params?: Record<string, unknown>) => apiRequest.get("/admin/kyc", params),
  approveKyc: (id: string) => apiRequest.post(`/admin/kyc/${id}/approve`),
  rejectKyc: (id: string, reason: string) => apiRequest.post(`/admin/kyc/${id}/reject`, { reason }),

  // Deposits
  listDeposits: (params?: Record<string, unknown>) => apiRequest.get("/admin/deposits", params),
  approveDeposit: (id: string) => apiRequest.post(`/admin/deposits/${id}/approve`),
  rejectDeposit: (id: string) => apiRequest.post(`/admin/deposits/${id}/reject`),
  verifyFlutterwave: (id: string) => apiRequest.post(`/admin/deposits/${id}/verify-flutterwave`),

  // Disputes
  listDisputes: (params?: Record<string, unknown>) => apiRequest.get("/admin/disputes", params),

  // Transactions
  listTransactions: (params?: Record<string, unknown>) => apiRequest.get("/admin/transactions", params),

  // Logs
  listLogs: (params?: Record<string, unknown>) => apiRequest.get("/admin/logs", params),

  // Profile
  getProfile: () => apiRequest.get("/admin/profile"),
  updateProfilePicture: (formData: FormData) => apiRequest.post("/admin/profile/picture", formData),

  // Super admin only
  listAdmins: (params?: Record<string, unknown>) => apiRequest.get("/admin/admins", params),
  createInvite: (email: string) => apiRequest.post("/admin/invites", { email }),
  acceptInvite: (token: string) => apiRequest.get("/admin/invites/accept", { token }),
  removeAdmin: (id: string) => apiRequest.post(`/admin/admins/${id}/remove`),
  upgradeAdmin: (id: string) => apiRequest.post(`/admin/admins/${id}/upgrade`),
  
};

export default adminApi;

