import { apiRequest } from "./request";

export const walletsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/wallets", params),
  getByCurrency: (currency: string) => apiRequest.get(`/wallets/${currency}`),
  getById: (walletId: string) => apiRequest.get(`/wallets/${walletId}`),
  create: (payload: Record<string, unknown>) => apiRequest.post("/wallets", payload),
  update: (walletId: string, payload: Record<string, unknown>) => apiRequest.patch(`/wallets/${walletId}`, payload),
  getBalances: () => apiRequest.get("/wallets/balances"),
};

export default walletsApi;
