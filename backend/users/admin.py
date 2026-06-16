from django.contrib import admin
from .models import User ,OTP


# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display=["id" , "username" , "role" , "email"]



@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display=["id" , "user", "otp_code" , "created_at" , "expires_at"]