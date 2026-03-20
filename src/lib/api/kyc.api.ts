import { apiRequest } from "./request";

export const kycApi = {
  getStatus: () => apiRequest.get("/kyc/status"),
  upload: (formData: FormData) => apiRequest.post("/kyc/upload", formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (payload: Record<string, unknown>) => apiRequest.patch("/kyc", payload),
  listSubmissions: (params?: Record<string, unknown>) => apiRequest.get("/kyc/submissions", params),
  verify: (kycId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/kyc/${kycId}/verify`, payload),
  reject: (kycId: string, payload?: Record<string, unknown>) => apiRequest.patch(`/kyc/${kycId}/reject`, payload),
};

export default kycApi;
