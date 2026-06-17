from django.contrib import admin

from .models import Company, CompanyService

# Register your models here.


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "owner__username",
        "name",
        "phone",
        "governorate",
        "city",
        "street",
        "is_verified",
        "created_at",
        "updated_at",
    ]


@admin.register(CompanyService)
class CompanyServicesAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "company",
        "procedure",
        "company_service_fee",
        "estimated_completion_days",
        "is_available",
        "created_at",
        "updated_at",
    ]
