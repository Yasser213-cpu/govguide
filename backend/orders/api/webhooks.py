import logging

import stripe
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from notifications.models import Notification
from notifications.tasks import send_company_notification

from ..models import Order, OrderStatusHistory, Payment

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            return HttpResponse(status=400)

        event_type = event["type"]
        data_object = event["data"]["object"]

        if event_type == "checkout.session.completed":
            self._handle_checkout_completed(data_object)
        elif event_type == "checkout.session.expired":
            self._handle_checkout_failed(data_object)
        elif event_type == "payment_intent.payment_failed":
            self._handle_payment_intent_failed(data_object)

        return HttpResponse(status=200)

    def _get_payment(self, session):
        payment_id = session.get("metadata", {}).get("payment_id")
        if payment_id:
            try:
                return Payment.objects.select_related(
                    "order", "order__service__company"
                ).get(pk=payment_id)
            except Payment.DoesNotExist:
                pass

        session_id = session.get("id")
        if session_id:
            try:
                return Payment.objects.select_related(
                    "order", "order__service__company"
                ).get(stripe_checkout_session_id=session_id)
            except Payment.DoesNotExist:
                pass

        return None

    @transaction.atomic
    def _handle_checkout_completed(self, session):
        payment = self._get_payment(session)
        if not payment:
            logger.warning("checkout.session.completed: payment not found")
            return

        if payment.status == Payment.SUCCESS:
            return

        payment.status = Payment.SUCCESS
        payment.paid_at = timezone.now()
        payment.stripe_payment_intent_id = session.get("payment_intent") or ""
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

    @transaction.atomic
    def _handle_checkout_failed(self, session):
        payment = self._get_payment(session)
        if not payment or payment.status == Payment.SUCCESS:
            return

        payment.status = Payment.FAILED
        payment.save(update_fields=["status"])

    @transaction.atomic
    def _handle_payment_intent_failed(self, payment_intent):
        payment_intent_id = payment_intent.get("id")
        if not payment_intent_id:
            return

        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent_id
            )
        except Payment.DoesNotExist:
            metadata = payment_intent.get("metadata", {})
            payment_id = metadata.get("payment_id")
            if not payment_id:
                return
            try:
                payment = Payment.objects.get(pk=payment_id)
            except Payment.DoesNotExist:
                return

        if payment.status == Payment.SUCCESS:
            return

        payment.status = Payment.FAILED
        if payment_intent_id:
            payment.stripe_payment_intent_id = payment_intent_id
        payment.save(update_fields=["status", "stripe_payment_intent_id"])
