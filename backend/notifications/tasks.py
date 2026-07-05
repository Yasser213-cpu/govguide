from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_order_notification(order_id, notification_type, message):
    """
    Create a Notification record for an order's owner (the client) and email them.
    Runs async via Celery on order status changes.
    """
    from orders.models import Order
    from notifications.models import Notification

    try:
        order = Order.objects.select_related("user").get(id=order_id)
    except Order.DoesNotExist:
        return f"Order {order_id} not found"

    user = order.user

    Notification.objects.create(
        user=user,
        order=order,
        notification_type=notification_type,
        message=message,
    )

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


@shared_task
def send_company_notification(company_owner_id, order_id, notification_type, message):
    """
    Create a Notification record for a company owner (new order / payment / review)
    and email them. Runs async via Celery.
    """
    from django.contrib.auth import get_user_model
    from orders.models import Order
    from notifications.models import Notification

    User = get_user_model()

    try:
        owner = User.objects.get(id=company_owner_id)
    except User.DoesNotExist:
        return f"User {company_owner_id} not found"

    order = None
    if order_id:
        order = Order.objects.filter(id=order_id).first()

    Notification.objects.create(
        user=owner,
        order=order,
        notification_type=notification_type,
        message=message,
    )

    try:
        send_mail(
            subject="GovConnect - New Activity",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[owner.email],
            fail_silently=True,
        )
    except Exception:
        pass

    return f"Notification sent to {owner.email} ({notification_type})"