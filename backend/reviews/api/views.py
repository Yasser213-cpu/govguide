from rest_framework.views import APIView
from orders.models import Order
from rest_framework.exceptions import NotFound
from ..models import Review
from .serializer import ReviewSerializer
from core.permissions import IsClient
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status


class ReviewAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAuthenticated(), IsClient()]

    def get_object(self, id):
        try:
            order = Order.objects.get(pk=id)
            return order
        except Order.DoesNotExist:
            raise NotFound("there is no order matches this id")

    def get(self, request, id):
        order = self.get_object(id)
        if not hasattr(order, "review"):
            return Response(
                {"detail": "This order did not has a review yet"},
                status.HTTP_400_BAD_REQUEST,
            )
        review = Review.objects.get(order=order)
        serializer = ReviewSerializer(review)
        return Response(serializer.data)

    def post(self, request, id):
        try:
            order = Order.objects.get(pk=id)
        except Order.DoesNotExist:
            raise NotFound("there is no order matches this id")

        self.check_object_permissions(request, order)

        serializer = ReviewSerializer(data=request.data, context={"order": order})
        if serializer.is_valid():
            serializer.save(order=order)
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        order = self.get_object(id)
        self.check_object_permissions(request, order)
        if not hasattr(order, "review"):
            return Response(
                {"detail": "This order did not has a review yet"},
                status.HTTP_400_BAD_REQUEST,
            )
        order.order_review.delete()
        return Response(status.HTTP_204_NO_CONTENT)

    def patch(self, request, id):
        order = self.get_object(id)
        self.check_object_permissions(request, order)
        if not hasattr(order, "order_review"):
            print("is triggered")
            return Response(
                {"detail": "This order did not has a review yet"},
                status.HTTP_400_BAD_REQUEST,
            )
        review = Review.objects.get(order=order)
        serializer = ReviewSerializer(
            review, data=request.data, partial=True, context={"order": order , "request":request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
