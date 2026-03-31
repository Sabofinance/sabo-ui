import { apiRequest } from "./request";

export const bidsApi = {
  place: (payload: {
    sabit_id: string;
    amount: string;
    proposed_rate_ngn: string;
    pin: string;
  }) => apiRequest.post("/bids", payload),

  listMine: (params?: Record<string, unknown>) => apiRequest.get("/bids/mine", params),

  listReceived: (params?: Record<string, unknown>) => apiRequest.get("/bids/received", params),

  accept: (bidId: string, payload: { pin: string }) =>
    apiRequest.put(`/bids/${bidId}/accept`, payload),

  reject: (bidId: string, payload: { pin: string; reason?: string }) =>
    apiRequest.put(`/bids/${bidId}/reject`, payload),

  withdraw: (bidId: string) => apiRequest.put(`/bids/${bidId}/withdraw`),
};

export default bidsApi;

