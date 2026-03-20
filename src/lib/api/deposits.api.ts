import { apiRequest } from "./request";

export const depositsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/deposits", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/deposits", payload),
  getById: (depositId: string) => apiRequest.get(`/deposits/${depositId}`),
  approve: (depositId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/deposits/${depositId}/approve`, payload),
  reject: (depositId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/deposits/${depositId}/reject`, payload),
};

export default depositsApi;
