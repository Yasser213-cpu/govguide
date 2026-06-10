from django.contrib import admin

from .models import Company

# Register your models here.

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display=["id" , "owner__username" , "name" , "phone" , "governorate" , "city" , "street" , "is_verified" , "created_at" , "updated_at"]
