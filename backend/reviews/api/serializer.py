from rest_framework import serializers
from ..models import Review
from orders.models import Order


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["comment", "rating"]

    def validate(self, validated_data):
        order = self.context["order"]
        request = self.context["request"]

        if request.method == "POST":
         if Review.objects.filter(order=order):
            raise serializers.ValidationError(
                {"review": "This order has been reviewd before"}
            )

        if order.status != Order.COMPLETED_STATUS:
            raise serializers.ValidationError(
                {"status": "Review can be applied only on complete status"}
            )

        return super().validate(validated_data)
