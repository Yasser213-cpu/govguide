from django.urls import path
from notifications.api.views import (
    NotificationListView,
    UnreadNotificationsCountView,
    MarkNotificationAsReadView,
    MarkAllNotificationsAsReadView,
)

urlpatterns = [
    path("", NotificationListView.as_view()),
    path("unread-count/", UnreadNotificationsCountView.as_view()),
    path("<int:notification_id>/read/", MarkNotificationAsReadView.as_view()),
    path("read-all/", MarkAllNotificationsAsReadView.as_view()),
]