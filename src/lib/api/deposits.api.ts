import { apiRequest } from "./request";

export const depositsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/deposits", params),
  getById: (depositId: string) => apiRequest.get(`/deposits/${depositId}`),
  ngnInitiate: (payload: Record<string, unknown>) =>
    apiRequest.post("/deposits/ngn/initiate", payload),
  foreign: (formData: FormData) =>
    apiRequest.post("/deposits/foreign", formData, { headers: { "Content-Type": undefined } }),
  cancel: (depositId: string) => apiRequest.post(`/deposits/${depositId}/cancel`),
};

export default depositsApi;
