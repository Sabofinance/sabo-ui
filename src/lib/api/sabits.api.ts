import { apiRequest } from "./request";

export const sabitsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/sabits", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/sabits", payload),
  getById: (sabitId: string) => apiRequest.get(`/sabits/${sabitId}`),
  cancel: (sabitId: string) => apiRequest.post(`/sabits/${sabitId}/cancel`),
};

export default sabitsApi;
