import { apiRequest } from "./request";

export const kycApi = {
  getStatus: () => apiRequest.get("/kyc/status"),
  upload: (formData: FormData) =>
    apiRequest.post("/kyc/upload", formData, { headers: { "Content-Type": undefined } }),
};

export default kycApi;
