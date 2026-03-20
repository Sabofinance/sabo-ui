export const adminKycApi = {
  approve: (id: string) => apiRequest.post(`/admin/kyc/${id}/approve`),
  reject: (id: string, reason: string) => apiRequest.post(`/admin/kyc/${id}/reject`, { reason }),
};
import { apiRequest } from "./request";

export const adminApi = {
  getDashboard: (params?: Record<string, unknown>) => apiRequest.get("/admin/dashboard", params),
  listUsers: (params?: Record<string, unknown>) => apiRequest.get("/admin/users", params),
  getUserById: (userId: string) => apiRequest.get(`/admin/users/${userId}`),
  updateUserStatus: (userId: string, payload: Record<string, unknown>) => apiRequest.patch(`/admin/users/${userId}/status`, payload),
  listTransactions: (params?: Record<string, unknown>) => apiRequest.get("/admin/transactions", params),
};

export default adminApi;
