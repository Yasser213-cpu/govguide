from django.utils import timezone

from notifications.models import Notification
from notifications.tasks import send_company_notification, send_order_notification

from ..models import Order, OrderStatusHistory, Payment


def mark_payment_success(payment, stripe_payment_intent_id=""):
    """
    Mark a payment as successful and advance the order to paid.
    Idempotent — safe to call from webhook and verify-payment endpoint.
    """
    if payment.status == Payment.SUCCESS:
        return False

    payment.status = Payment.SUCCESS
    payment.paid_at = timezone.now()
    if stripe_payment_intent_id:
        payment.stripe_payment_intent_id = stripe_payment_intent_id
    payment.save(
        update_fields=["status", "paid_at", "stripe_payment_intent_id"]
    )

    order = payment.order
    if order.status != Order.PAID_STATUS:
        order.status = Order.PAID_STATUS
        order.save(update_fields=["status", "updated_at"])
        OrderStatusHistory.objects.create(
            order=order,
            status=Order.PAID_STATUS,
        )

        company_owner = order.service.company.owner
        send_company_notification.delay(
            company_owner.id,
            order.id,
            Notification.PAID,
            f"تم دفع الطلب رقم #{order.id}",
        )
        send_order_notification.delay(
            order.id,
            Notification.PAID,
            f"تم تأكيد الدفع لطلبك رقم #{order.id}",
        )

    return True
