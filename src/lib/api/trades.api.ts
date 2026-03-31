import { apiRequest } from "./request";

export const tradesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/trades", params),
  getById: (tradeId: string) => apiRequest.get(`/trades/${tradeId}`),
  
  // Spec-aligned trade lifecycle
  initiate: (payload: { sabit_id: string; amount: string; pin: string }) => apiRequest.post("/trades/initiate", payload),
  sellerConfirm: (tradeId: string, payload: { pin: string }) => apiRequest.put(`/trades/${tradeId}/seller-confirm`, payload),
  buyerConfirm: (tradeId: string) => apiRequest.post(`/trades/${tradeId}/confirm`),
  complete: (tradeId: string) => apiRequest.post(`/trades/${tradeId}/complete`),
  cancel: (tradeId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/trades/${tradeId}/cancel`, payload),
};

export default tradesApi;
