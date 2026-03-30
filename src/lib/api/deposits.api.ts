import { apiRequest } from "./request";
import type { AxiosRequestConfig } from "axios";

export const depositsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/deposits", params),
  create: (payload: Record<string, unknown>) => apiRequest.post("/deposits", payload),
  getById: (depositId: string) => apiRequest.get(`/deposits/${depositId}`),
  ngnInitiate: (payload: Record<string, unknown>) => apiRequest.post("/deposits/ngn/initiate", payload),
  foreign: (formData: FormData, config?: AxiosRequestConfig) =>
    apiRequest.post("/deposits/foreign", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...(config || {}),
    }),
};

export default depositsApi;
