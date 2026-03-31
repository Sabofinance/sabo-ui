import { apiRequest } from "./request";

export const ratingsApi = {
  create: (payload: { trade_id: string; score: number; comment?: string }) => apiRequest.post("/ratings", payload),
  getUser: (id: string) => apiRequest.get(`/ratings/user/${id}`),
};

export default ratingsApi;

