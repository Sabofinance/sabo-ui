import { apiRequest } from "./request";

export const disputesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/disputes", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/disputes", payload),
  getById: (disputeId: string) => apiRequest.get(`/disputes/${disputeId}`),
  resolve: (disputeId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/disputes/${disputeId}/resolve`, payload),
  close: (disputeId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/disputes/${disputeId}/close`, payload),
};

export default disputesApi;
