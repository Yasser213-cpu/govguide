from notifications.models import Notification


def create_chat_notification(*, sender, receiver, conversation, message):
    Notification.objects.create(
        user=receiver,
        order=None,
        notification_type=Notification.CHAT_MESSAGE,
        message=message.content,
    )