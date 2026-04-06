import { apiRequest } from "./request";

export const walletsApi = {
  list: () => apiRequest.get("/wallets"),
  getByCurrency: (currency: string) => apiRequest.get(`/wallets/${currency}`),
};

export default walletsApi;
