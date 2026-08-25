import { apiRequest } from "../api";
import { NotificationPage } from "@/types/notification";

export async function getNotifications(token: string, params: {
  page: number;
  size: number;
  unreadOnly?: boolean;
}): Promise<NotificationPage> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
  });
  
  if (params.unreadOnly !== undefined) {
    query.append("unreadOnly", params.unreadOnly.toString());
  }

  const response = await apiRequest(`/api/notifications?${query.toString()}`, token);
  return response as NotificationPage;
}

export async function getUnreadNotificationCount(token: string): Promise<number> {
  const response = await apiRequest("/api/notifications/unread-count", token);
  return (response as { count: number }).count;
}

export async function markNotificationRead(token: string, id: string): Promise<void> {
  await apiRequest(`/api/notifications/${id}/read`, token, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await apiRequest("/api/notifications/read-all", token, {
    method: "POST",
  });
}
