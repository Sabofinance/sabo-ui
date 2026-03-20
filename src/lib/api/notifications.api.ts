import { apiRequest } from "./request";

export const notificationsApi = {
  list: () => apiRequest.get("/notifications"),
  markRead: (id: string) => apiRequest.patch(`/notifications/${id}/read`),
};

export default notificationsApi;
