import { apiRequest } from "./request";

export const ratesApi = {
  list: () => apiRequest.get("/rates"),

  // Returns the single rate entry matching the given currency pair.
  // The API returns all rates from GET /rates; this helper filters locally.
  // Pairs are stored as "{FOREIGN}/NGN" (e.g. "GBP/NGN"). Accepts any argument
  // order — ("NGN","GBP") and ("GBP","NGN") both resolve to GBP/NGN.
  getByPair: async (from: string, to: string) => {
    const res = await apiRequest.get<{ rates: Array<{ pair: string; rate: string; [k: string]: unknown }> }>("/rates");
    if (!res.success || !res.data) return res;
    const target = [
      `${from.toUpperCase()}/${to.toUpperCase()}`,
      `${to.toUpperCase()}/${from.toUpperCase()}`,
    ];
    const match = (res.data as any).rates?.find((r: any) =>
      target.includes(String(r.pair || "").toUpperCase())
    );
    return { ...res, data: match ?? null };
  },

  history: (pair: string) => apiRequest.get(`/rates/history/${pair}`),
};

export default ratesApi;
