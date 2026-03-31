import { apiRequest } from "./request";

export const notificationsApi = {
  list: (params?: Record<string, unknown>) => apiRequest.get("/notifications", params),
  markRead: (id: string) => apiRequest.patch(`/notifications/${id}/read`),
  markAllRead: () => apiRequest.post("/notifications/mark-all-read"),
};

export default notificationsApi;
