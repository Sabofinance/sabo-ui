import { apiRequest } from "./request";

export const disputesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/disputes", params),
  getById: (disputeId: string) => apiRequest.get(`/disputes/${disputeId}`),
  raise: (payload: { trade_id: string; reason: string }) =>
    apiRequest.post("/disputes/raise", payload),
};

export default disputesApi;
