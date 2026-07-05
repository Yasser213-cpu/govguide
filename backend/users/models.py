from django.db import models
from django.contrib.auth.models import AbstractUser
from core.services import generate_otp
from django.conf import settings

# Create your models here.


class User(AbstractUser):
    CLIENT_ROLE = "client"
    COMPANY_ROLE = "company"
    ROLE_CHOICES=[
        (CLIENT_ROLE,"Client"),
        (COMPANY_ROLE,"Company")
    ]
    role = models.CharField(choices=ROLE_CHOICES , max_length=20)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    governorate = models.CharField(max_length=100, blank=True)



class OTP(models.Model):
        verification_purpose = "email_verification"
        reset_password_purpose = "reset_password"
        OTP_PURPOSE_CHOICES = [
            (verification_purpose,"Email verification"),
            (reset_password_purpose,"Reset password")

        ]
        user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE , related_name="otps")
        otp_code = models.CharField(max_length=6 , default=generate_otp )
        created_at = models.DateTimeField(auto_now_add=True)
        expires_at = models.DateTimeField(blank=True , null=True)
        purpose = models.CharField(choices=OTP_PURPOSE_CHOICES ,max_length=18, null=True)


        def __str__(self):
            return self.user.username


