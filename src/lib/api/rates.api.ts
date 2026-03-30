import { apiRequest } from "./request";

export const ratesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/rates", params),
  // API_DOCUMENTATION.md only defines GET /rates. We keep this helper for existing UI,
  // but it resolves via /rates (no /rates/pair dependency).
  getByPair: (base: string, quote: string) => apiRequest.get("/rates", { base, quote }),
};

export default ratesApi;
