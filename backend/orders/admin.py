from django.contrib import admin
from .models import Order, Document


# Register your models here.
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    model = Order
    list_display = ["id", "user", "service", "status", "created_at", "updated_at"]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    model = Document
    list_display = ["order", "file", "uploaded_at"]
