import { apiRequest } from "./request";

export const ratesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/rates", params),
  getByPair: (base: string, quote: string) => apiRequest.get("/rates/pair", { base, quote }),
  create: (payload: Record<string, unknown>) => apiRequest.post("/rates", payload),
  update: (rateId: string, payload: Record<string, unknown>) => apiRequest.patch(`/rates/${rateId}`, payload),
};

export default ratesApi;
