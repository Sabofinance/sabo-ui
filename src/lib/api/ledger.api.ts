import { apiRequest } from "./request";

export const ledgerApi = {
  listEntries: (params?: Record<string, unknown>) => apiRequest.get("/ledger", params),
  getEntryById: (entryId: string) => apiRequest.get(`/ledger/${entryId}`),
  getSummary: (params?: Record<string, unknown>) => apiRequest.get("/ledger/summary", params),
};

export default ledgerApi;
