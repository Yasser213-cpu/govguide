from rest_framework import serializers
from ..models import Order, Document, OrderStatusHistory
from reviews.models import Review
from procedures.models import Procedure, Requirement
from companies.api.serializers import CompanyServicesSerializer

"""
client
"""


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id", "notes", "service"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        user = self.context["request"].user
        service = attrs["service"]

        # COMPLETED and REJECTED are both terminal statuses (see
        # OrderStatusSerializer.allowed_transition — neither has any
        # outgoing transitions), so orders in either state should NOT
        # count as "active" and block a new order.
        active_orders_qs = Order.objects.filter(user=user).exclude(
            status__in=[Order.COMPLETED_STATUS, Order.REJECTED_STATUS]
        )

        # Case 1: same exact service (same company + same procedure)
        has_active_order_same_service = active_orders_qs.filter(
            service=service,
        ).exists()

        if has_active_order_same_service:
            raise serializers.ValidationError(
                {"service": "You already have an active order for this service."}
            )

        # Case 2: same procedure, different company
        # (blocks e.g. requesting "ID renewal" from Company B while an
        # active order for "ID renewal" from Company A already exists)
        has_active_order_same_procedure = active_orders_qs.filter(
            service__procedure=service.procedure,
        ).exists()

        if has_active_order_same_procedure:
            raise serializers.ValidationError(
                {
                    "service": (
                        "You already have an active order for this service "
                        "with another company. Please complete or cancel it "
                        "before submitting a new request."
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        order = Order.objects.create(**validated_data)
        OrderStatusHistory.objects.create(
            order=order,
            status=Order.PENDING_STATUS,
        )
        return order


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["requirement", "file"]

    def validate(self, attrs):
        order = Order.objects.get(pk=self.context["order_id"])

        requirement = attrs["requirement"]

        if not order.service.procedure.requirements.filter(id=requirement.id).exists():
            raise serializers.ValidationError(
                "This requirement does not belong to this order's procedure."
            )

        if Document.objects.filter(order=order, requirement=requirement).exists():
            raise serializers.ValidationError(
                "A document for this requirement already exists."
            )

        return attrs


class ClientOrderDetailSerializer(serializers.ModelSerializer):
    company = serializers.StringRelatedField(source="service.company")
    procedure = serializers.StringRelatedField(source="service.procedure")
    documents = DocumentUploadSerializer(many=True, read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "company",
            "procedure",
            "status",
            "notes",
            "rejection_reason",
            "documents",
            "created_at",
            "has_review",
        ]

    def get_has_review(self, obj):
        return Review.objects.filter(order=obj).exists()


"""
company
"""


class CompanyDocumentSerializer(serializers.ModelSerializer):
    requirement = serializers.StringRelatedField()

    class Meta:
        model = Document
        fields = ["id", "requirement", "file", "uploaded_at"]


class CompanyOrderDetailSerializer(serializers.ModelSerializer):
    client = serializers.StringRelatedField(source="user")
    procedure = serializers.StringRelatedField(source="service.procedure")
    documents = CompanyDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "client",
            "procedure",
            "status",
            "notes",
            "documents",
            "created_at",
        ]


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]

    def validate_status(self, value):
        new_status = value
        old_status = self.instance.status

        allowed_transition = {
            Order.PENDING_STATUS: [Order.ACCEPTED_STATUS, Order.REJECTED_STATUS],
            Order.PAID_STATUS: [Order.IN_PROGRESS_STATUS],
            Order.IN_PROGRESS_STATUS: [Order.COMPLETED_STATUS],
            Order.ACCEPTED_STATUS: [],
            Order.COMPLETED_STATUS: [],
            Order.REJECTED_STATUS: [],
        }

        if new_status not in allowed_transition[old_status]:
            raise serializers.ValidationError(
                f"cannot change status from {old_status} to {new_status}"
            )

        OrderStatusHistory.objects.create(
            order=self.context["order"], status=new_status
        )
        return value


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ["status", "changed_at"]
