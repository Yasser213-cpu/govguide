import axiosClient from "../../api/axiosClient";

export const getNotifications = async () => {
  const res = await axiosClient.get("/api/v1/notifications/");
  return res.data;
};

export const getUnreadNotificationsCount = async () => {
  const res = await axiosClient.get("/api/v1/notifications/unread-count/");
  return res.data.unread_count;
};

export const markNotificationAsRead = async (notificationId) => {
  const res = await axiosClient.post(
    `/api/v1/notifications/${notificationId}/read/`,
  );
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await axiosClient.post("/api/v1/notifications/read-all/");
  return res.data;
};
