import { apiRequest } from "./request";

export const withdrawalsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/withdrawals", params),
  request: (payload: { beneficiary_id: string; amount: string; pin: string }) =>
    apiRequest.post("/withdrawals/request", payload),
  getById: (withdrawalId: string) => apiRequest.get(`/withdrawals/${withdrawalId}`),
};

export default withdrawalsApi;
