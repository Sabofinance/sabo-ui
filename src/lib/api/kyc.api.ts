import type { AxiosRequestConfig } from "axios";
import { apiRequest } from "./request";

export const kycApi = {
  getStatus: () => apiRequest.get("/kyc/status"),
  upload: (formData: FormData, config?: AxiosRequestConfig) =>
    apiRequest.post("/kyc/upload", formData, {
      ...config,
      headers: { ...config?.headers, "Content-Type": undefined },
    }),
};

export default kycApi;
