from core.services import CRUDAPIView
from .serializers import (
    OrderCreateSerializer,
    DocumentUploadSerializer,
    ClientOrderDetailSerializer,
    CompanyOrderDetailSerializer,
    OrderStatusSerializer,
    OrderStatusHistorySerializer,
)
from rest_framework.response import Response
from rest_framework import status
from ..models import Order, OrderStatusHistory
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from core.permissions import IsClient, IsCompany, isCompanyOwner
from rest_framework.permissions import IsAuthenticated
from ai_agents.tasks import run_ocr_on_document
from notifications.tasks import send_order_notification


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
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)


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

class PayOrderAPIView(APIView):
    def get_permissions(self):
        return [IsAuthenticated(), IsClient()]

    def post(self, request, id):
        try:

            order = Order.objects.get(pk=id)
            self.check_object_permissions(request, order)

            if order.status == Order.PAID_STATUS:
                return Response(
                    {"detail": "This order has already been paid."},
                    status.HTTP_400_BAD_REQUEST,
                )
            elif order.status != Order.ACCEPTED_STATUS:
                return Response(
                    {"error": "Only accepted orders can be paid."},
                    status.HTTP_400_BAD_REQUEST,
                )

            order.status = Order.PAID_STATUS
            order.save()

            OrderStatusHistory.objects.create(order=order, status=Order.PAID_STATUS)

            return Response(
                {"message": "Payment completed successfully.", "status": "paid"}
            )

        except Order.DoesNotExist:
            raise NotFound("There is no order matches this id")


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
