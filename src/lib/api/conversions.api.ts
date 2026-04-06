import { apiRequest } from "./request";

export const conversionsApi = {
  quote: (payload: Record<string, unknown>) => apiRequest.post("/conversions/quote", payload),
  execute: (payload: Record<string, unknown>) => apiRequest.post("/conversions/execute", payload),
};

export default conversionsApi;
