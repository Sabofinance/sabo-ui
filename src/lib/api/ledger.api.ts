import { apiRequest } from "./request";

export const ledgerApi = {
  listEntries: (params?: Record<string, unknown>) => apiRequest.get("/ledger", params),
  listByWalletId: (walletId: string, params?: Record<string, unknown>) => apiRequest.get(`/ledger/${walletId}`, params),
  getSummary: (params?: Record<string, unknown>) => apiRequest.get("/ledger/summary", params),
};

export default ledgerApi;
