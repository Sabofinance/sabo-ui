import { apiRequest } from "./request";

export const sabitsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/sabits", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/sabits", payload),
  getById: (sabitId: string) => apiRequest.get(`/sabits/${sabitId}`),
  cancel: (sabitId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/sabits/${sabitId}/cancel`, payload),
  activate: (sabitId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/sabits/${sabitId}/activate`, payload),
};

export default sabitsApi;
