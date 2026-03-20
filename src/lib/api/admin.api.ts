import { apiRequest } from "./request";

type AdminUserData = Record<string, unknown>;

type KycData = Record<string, unknown>;
type DepositData = Record<string, unknown>;
type AdminData = Record<string, unknown>;
type LogData = Record<string, unknown>;

export const adminApi = {
  // Admin dashboard (optional)
  getDashboard: (params?: Record<string, unknown>) => apiRequest.get("/admin/dashboard", params),

  // Admin auth (OTP login already in admin-auth.api)

  // Users
  listUsers: (params?: Record<string, unknown>) => apiRequest.get<AdminUserData[]>("/admin/users", params),
  getUserById: (id: string) => apiRequest.get<AdminUserData>(`/admin/users/${id}`),
  suspendUser: (id: string) => apiRequest.post<null>(`/admin/users/${id}/suspend`),
  reinstateUser: (id: string) => apiRequest.post<null>(`/admin/users/${id}/reinstate`),

  // KYC
  listKyc: (params?: Record<string, unknown>) => apiRequest.get<KycData[]>("/admin/kyc", params),
  approveKyc: (id: string) => apiRequest.post<null>(`/admin/kyc/${id}/approve`),
  rejectKyc: (id: string, reason?: string) => apiRequest.post<null>(`/admin/kyc/${id}/reject`, { reason }),

  // Deposits
  listDeposits: (params?: Record<string, unknown>) => apiRequest.get<DepositData[]>("/admin/deposits", params),
  approveDeposit: (id: string) => apiRequest.post<null>(`/admin/deposits/${id}/approve`),
  rejectDeposit: (id: string, reason?: string) => apiRequest.post<null>(`/admin/deposits/${id}/reject`, { reason }),

  // Super admin only
  listAdmins: (params?: Record<string, unknown>) => apiRequest.get<AdminData[]>("/admin/admins", params),
  promoteUser: (id: string) => apiRequest.post<null>(`/admin/users/${id}/promote`),
  demoteAdmin: (id: string) => apiRequest.post<null>(`/admin/admins/${id}/demote`),
  listLogs: (params?: Record<string, unknown>) => apiRequest.get<LogData[]>("/admin/logs", params),

  // Legacy compatibility
  listTransactions: (params?: Record<string, unknown>) => apiRequest.get("/admin/transactions", params),

  // Disputes
  listDisputes: (params?: Record<string, unknown>) => apiRequest.get<Record<string, unknown>[]>("/admin/disputes", params),
};

export default adminApi;

