from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_order_notification(order_id, notification_type, message):
    """
    Create a Notification record for an order's owner and email them.
    Runs async via Celery on order status changes.
    """
    # Imports inside the task to avoid circular imports at load time
    from orders.models import Order
    from notifications.models import Notification

    try:
        order = Order.objects.select_related("user").get(id=order_id)
    except Order.DoesNotExist:
        return f"Order {order_id} not found"

    user = order.user

    # 1) Create the in-app notification record
    Notification.objects.create(
        user=user,
        order=order,
        notification_type=notification_type,
        message=message,
    )

    # 2) Send an email (best-effort; don't fail the task if email errors)
    try:
        send_mail(
            subject="GovConnect - Order Update",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass

    return f"Notification sent to {user.email} ({notification_type})"