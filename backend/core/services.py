from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
import secrets
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated


def generate_otp():
    return f"{secrets.randbelow(1_000_000):06d}"


def send_verification_email(user, otp):

    subject = "Email Verification"
    message = f"""
                                Hi {user.username}, here is your verification OTP {otp.otp_code} ,it expires in 5 minute
                                """
    receiver = [user.email]

    send_mail(
        subject,
        message,
        None,
        receiver,
        fail_silently=False,
    )


def send_reset_password_otp(user, otp):
    subject = "Reset Password"

    message = f"""
                                Hi {user.username}, here is your reset password OTP {otp.otp_code} , it expires in 5 minute
                                
                                """
    receiver = [user.email]

    send_mail(
        subject,
        message,
        None,
        receiver,
        fail_silently=False,
    )


