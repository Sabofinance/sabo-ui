import { apiRequest } from "./request";

export const beneficiariesApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/beneficiaries", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/beneficiaries", payload),
  getById: (beneficiaryId: string) => apiRequest.get(`/beneficiaries/${beneficiaryId}`),
  update: (beneficiaryId: string, payload: Record<string, unknown>) => apiRequest.patch(`/beneficiaries/${beneficiaryId}`, payload),
  remove: (beneficiaryId: string) => apiRequest.delete(`/beneficiaries/${beneficiaryId}`),
};

export default beneficiariesApi;
