import logging

import stripe
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from ..models import Payment
from ..services.payment import mark_payment_success

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
        # `session` is a stripe StripeObject, not a dict — it has no
        # .get() method. Use getattr (with defaults) or attribute
        # access instead, which StripeObject supports via __getattr__.
        metadata = getattr(session, "metadata", None)
        payment_id = getattr(metadata, "payment_id", None) if metadata else None

        if payment_id:
            try:
                return Payment.objects.select_related(
                    "order", "order__service__company"
                ).get(pk=payment_id)
            except Payment.DoesNotExist:
                pass

        session_id = getattr(session, "id", None)
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

        mark_payment_success(
            payment,
            stripe_payment_intent_id=getattr(session, "payment_intent", "") or "",
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
        payment_intent_id = getattr(payment_intent, "id", None)
        if not payment_intent_id:
            return

        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent_id
            )
        except Payment.DoesNotExist:
            metadata = getattr(payment_intent, "metadata", None)
            payment_id = getattr(metadata, "payment_id", None) if metadata else None
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