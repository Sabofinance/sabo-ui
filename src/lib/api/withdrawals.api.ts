import { apiRequest } from "./request";

export const withdrawalsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/withdrawals", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/withdrawals", payload),
  getById: (withdrawalId: string) => apiRequest.get(`/withdrawals/${withdrawalId}`),
  approve: (withdrawalId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/withdrawals/${withdrawalId}/approve`, payload),
  reject: (withdrawalId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/withdrawals/${withdrawalId}/reject`, payload),
};

export default withdrawalsApi;
