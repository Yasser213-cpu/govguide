from django.contrib import admin
from .models import Order, Document, OrderStatusHistory


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
