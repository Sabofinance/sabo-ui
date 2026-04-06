import { apiRequest } from "./request";

export const beneficiariesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/beneficiaries", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/beneficiaries", payload),
  setDefault: (beneficiaryId: string) => apiRequest.put(`/beneficiaries/${beneficiaryId}/set-default`),
  remove: (beneficiaryId: string) => apiRequest.delete(`/beneficiaries/${beneficiaryId}`),
};

export default beneficiariesApi;
