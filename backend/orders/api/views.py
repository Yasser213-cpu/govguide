from .serializers import (
    OrderCreateSerializer,
    DocumentUploadSerializer,
    ClientOrderDetailSerializer,
    CompanyOrderDetailSerializer,
    OrderStatusSerializer,
    OrderStatusHistorySerializer,
    DocumentSerializer,
)
from rest_framework.response import Response
from rest_framework import status
from ..models import Order, OrderStatusHistory, Payment
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from core.permissions import IsClient, IsCompany, isCompanyOwner
from rest_framework.permissions import IsAuthenticated
from ai_agents.tasks import run_ocr_on_document
from notifications.tasks import send_order_notification, send_company_notification
from notifications.models import Notification
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class ClientOrdersAPIView(APIView):

    def get_permissions(self):

        return [IsAuthenticated(), IsClient()]

    def get_object(self, id):
        try:
            order = Order.objects.get(pk=id)
            self.check_object_permissions(self.request, order)
            return order
        except Order.DoesNotExist:
            raise NotFound("There is no order matching this id.")

    def get(self, request, id=None):
        if id:
            order = self.get_object(id)
            serializer = ClientOrderDetailSerializer(order)
            return Response(serializer.data, status.HTTP_200_OK)

        orders = Order.objects.filter(user=request.user)
        serializer = ClientOrderDetailSerializer(orders, many=True)
        return Response(serializer.data, status.HTTP_200_OK)

    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        order = serializer.save(user=request.user)

        company_owner = order.service.company.owner
        client_name = request.user.get_full_name() or request.user.email

        send_company_notification.delay(
            company_owner.id,
            order.id,
            Notification.NEW_ORDER,
            f"طلب جديد رقم #{order.id} من {client_name}",
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompanyOrdersAPIView(APIView):

    def get_permissions(self):
        return [IsAuthenticated(), isCompanyOwner()]

    def get_object(self, id):
        try:
            order = Order.objects.get(pk=id)
            self.check_object_permissions(self.request, order.service)
            return order
        except Order.DoesNotExist:
            raise NotFound("There is no order matching this id.")

    def get(self, request, id=None):
        if id:
            order = self.get_object(id)
            serializer = CompanyOrderDetailSerializer(order)
            return Response(serializer.data, status.HTTP_200_OK)
        orders = Order.objects.filter(
            service__company__owner=request.user
        ).select_related("service")
        serializer = CompanyOrderDetailSerializer(orders, many=True)
        return Response(serializer.data)


class UploadOrderDocument(APIView):

    def get_permissions(self):
        return [IsAuthenticated(), IsClient()]

    def get_object(self, id):
        try:
            order = Order.objects.get(pk=id)
            self.check_object_permissions(self.request, order)
            return order
        except Order.DoesNotExist:
            raise NotFound("There is no order matches this id")

    def get(self, request, id):
        order = self.get_object(id)
        documents = order.documents.all()
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data, status.HTTP_200_OK)

    def post(self, request, id):
        try:
            order = Order.objects.get(pk=id)
        except Order.DoesNotExist:
            return Response(
                {"message": "there is no order matches this id"},
                status.HTTP_404_NOT_FOUND,
            )

        if order.status != Order.PENDING_STATUS:
            return Response(
                {
                    "message": "Documents can not be uploaded  any more when status is not pending "
                },
                status.HTTP_400_BAD_REQUEST,
            )

        self.check_object_permissions(request, order)

        serializer = DocumentUploadSerializer(
            data=request.data, context={"order_id": id}
        )
        if serializer.is_valid():
            document = serializer.save(order=order)
            run_ocr_on_document.delay(document.id)
            return Response(serializer.data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

class OrderStatusAPIView(APIView):

    def get_permissions(self):
        return [IsAuthenticated(), isCompanyOwner()]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        self.check_object_permissions(request, order.service)

        serializer = OrderStatusSerializer(
            order,
            data=request.data,
            partial=True,
            context={"order": order},
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        new_status = serializer.validated_data.get("status")

        messages = {
            "accepted": f"تم قبول طلبك رقم #{order.id}",
            "rejected": f"تم رفض طلبك رقم #{order.id}",
            "paid": f"تم تأكيد الدفع لطلبك رقم #{order.id}",
            "completed": f"تم إكمال طلبك رقم #{order.id}",
        }

        if new_status in messages:
            send_order_notification.delay(
                order.id,
                new_status,
                messages[new_status],
            )

        return Response(serializer.data)


class CreateCheckoutSessionAPIView(APIView):
    def get_permissions(self):
        return [IsAuthenticated(), IsClient()]

    def post(self, request, id):
        try:
            order = Order.objects.select_related(
                "service__procedure", "service__company"
            ).get(pk=id)
            self.check_object_permissions(request, order)
        except Order.DoesNotExist:
            raise NotFound("There is no order matching this id.")

        if order.status == Order.PAID_STATUS:
            return Response(
                {"detail": "This order has already been paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status != Order.ACCEPTED_STATUS:
            return Response(
                {"error": "Only accepted orders can be paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                "amount": order.service.company_service_fee,
                "currency": "egp",
            },
        )

        if payment.status == Payment.SUCCESS:
            return Response(
                {"detail": "This order has already been paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not created and payment.status == Payment.FAILED:
            payment.status = Payment.PENDING
            payment.save(update_fields=["status"])

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": payment.currency,
                        "product_data": {"name": order.procedure.name},
                        "unit_amount": int(payment.amount * 100),
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=(
                f"{settings.FRONTEND_URL}/user/my-requests/{order.id}"
                "?payment=success"
            ),
            cancel_url=(
                f"{settings.FRONTEND_URL}/user/my-requests/{order.id}"
                "?payment=cancelled"
            ),
            metadata={
                "order_id": str(order.id),
                "payment_id": str(payment.id),
            },
        )

        payment.stripe_checkout_session_id = session.id
        payment.save(update_fields=["stripe_checkout_session_id"])

        return Response({"checkout_url": session.url})


class PayOrderAPIView(APIView):
    def get_permissions(self):
        return [IsAuthenticated(), IsClient()]

    def post(self, request, id):
        return Response(
            {
                "error": (
                    "Direct payment is disabled. "
                    "Use the create-checkout-session endpoint instead."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )



class OrderStatusHistoryAPIView(APIView):
    def get_permissions(self):
        return [IsAuthenticated(), IsClient()]

    def get(self, request, id):

        try:
            order = Order.objects.get(pk=id)
            self.check_object_permissions(request, order)
            orders = OrderStatusHistory.objects.filter(order=order)
            serializer = OrderStatusHistorySerializer(orders, many=True)
            return Response(serializer.data)
        except Order.DoesNotExist:
            raise NotFound("There is no order matches this id")
