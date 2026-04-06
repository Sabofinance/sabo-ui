import { apiRequest } from "./request";

export const tradesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/trades", params),
  getById: (tradeId: string) => apiRequest.get(`/trades/${tradeId}`),
  initiate: (payload: { sabit_id: string; amount: string; pin: string }) =>
    apiRequest.post("/trades/initiate", payload),
  sellerConfirm: (tradeId: string, payload: { pin: string }) =>
    apiRequest.put(`/trades/${tradeId}/seller-confirm`, payload),
};

export default tradesApi;
