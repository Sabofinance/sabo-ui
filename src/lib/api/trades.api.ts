import { apiRequest } from "./request";

export const tradesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/trades", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/trades", payload),
  getById: (tradeId: string) => apiRequest.get(`/trades/${tradeId}`),
  execute: (tradeId: string, payload?: Record<string, unknown>) => apiRequest.post(`/trades/${tradeId}/execute`, payload),
  cancel: (tradeId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/trades/${tradeId}/cancel`, payload),
};

export default tradesApi;
