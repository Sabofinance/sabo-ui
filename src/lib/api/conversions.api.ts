import { apiRequest } from "./request";

export const conversionsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/conversions", params),
  quote: (payload: Record<string, unknown>) => apiRequest.post("/conversions/quote", payload),
  execute: (payload: Record<string, unknown>) => apiRequest.post("/conversions/execute", payload),
  getById: (conversionId: string) => apiRequest.get(`/conversions/${conversionId}`),
};

export default conversionsApi;
