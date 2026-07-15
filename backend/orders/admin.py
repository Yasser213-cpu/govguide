from django.contrib import admin
from .models import Order, Document, OrderStatusHistory, Payment


# Register your models here.
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    model = Order
    list_display = ["id", "user", "service", "status", "created_at", "updated_at"]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    model = Document
    list_display = ["order", "file", "uploaded_at"]


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    model = OrderStatusHistory
    list_display = ["id", "status", "changed_at", "order"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "order",
        "amount",
        "currency",
        "status",
        "paid_at",
        "created_at",
    ]
    list_filter = ["status", "currency"]
    search_fields = ["order__id", "stripe_checkout_session_id"]
