from rest_framework import serializers
from ..models import Review
from orders.models import Order


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "comment", "rating", "created_at", "updated_at"]
        read_only_fileds = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        order = self.context["order"]

        qs = Review.objects.filter(order=order)

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                {"review": "This order has been reviewed before."}
            )

        if order.status != Order.COMPLETED_STATUS:
            raise serializers.ValidationError(
                {"status": "Review can be applied only on completed orders."}
            )

        return attrs
