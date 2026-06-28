from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from notifications.models import Notification
from notifications.api.serializers import NotificationSerializer


class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only the logged-in user's own notifications
        return Notification.objects.filter(user=self.request.user)