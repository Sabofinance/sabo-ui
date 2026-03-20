import { apiRequest } from "./request";

export const conversionsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/conversions", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/conversions", payload),
  getById: (conversionId: string) => apiRequest.get(`/conversions/${conversionId}`),
  quote: (payload: Record<string, unknown>) => apiRequest.post("/conversions/quote", payload),
};

export default conversionsApi;
