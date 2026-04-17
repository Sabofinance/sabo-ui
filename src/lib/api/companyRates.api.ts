import { apiRequest } from "./request";

export const companyRatesApi = {
  list: () => apiRequest.get("/company-rates"),
  get: (currency: string) =>
    apiRequest.get(`/company-rates/${encodeURIComponent(currency)}`),
};

export default companyRatesApi;
