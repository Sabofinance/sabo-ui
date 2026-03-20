import { apiRequest } from "./request";

export const chatApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/chat/messages", params),
  send: (payload: Record<string, unknown>) => apiRequest.post("/chat/messages", payload),
};

export default chatApi;

