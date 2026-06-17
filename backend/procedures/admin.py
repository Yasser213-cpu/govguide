from django.contrib import admin
from .models import Procedure

# Register your models here.


@admin.register(Procedure)
class ProceduresAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "name",
        "estimated_government_fee",
        "estimated_processing_days",
        "government_authority",
        "is_active",
        "created_at",
        "updated_at",
    ]
