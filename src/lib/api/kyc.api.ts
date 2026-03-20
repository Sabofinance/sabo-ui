import { apiRequest } from "./request";

export const kycApi = {
  getStatus: () => apiRequest.get("/kyc/status"),
  submit: (payload: Record<string, unknown>) => apiRequest.post("/kyc", payload),
  update: (payload: Record<string, unknown>) => apiRequest.patch("/kyc", payload),
  listSubmissions: (params?: Record<string, unknown>) => apiRequest.get("/kyc/submissions", params),
  verify: (kycId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/kyc/${kycId}/verify`, payload),
  reject: (kycId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/kyc/${kycId}/reject`, payload),
};

export default kycApi;
