from rest_framework.views import APIView
from .serializers import RegistrationSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    MyTokenObtainPairSerializer,
    EmailSerializer,
    verfiyEmailSerializer,
    ResetPasswordSerializer
)
from core.services import send_verification_email, send_reset_password_otp
from ..models import OTP, User
from django.utils import timezone



class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "detail": "Registration successful. An OTP has been sent to your email address. Please verify your email to activate your account."
                },
                status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class VerifyEmail(APIView):
    def post(self, request):
        serializer = verfiyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        requested_otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(
                otp_code=requested_otp, user=user, purpose=OTP.verification_purpose
            )
            if timezone.now() > otp.expires_at:
                return Response(
                    {
                        "detail": "OTP has expired. Please request a new verification code."
                    },
                    status.HTTP_400_BAD_REQUEST,
                )
            user.is_verified = True
            user.save()
            otp.delete()
            return Response(
                {"detail": "Email verified successfully. You can log in now."},
                status.HTTP_200_OK,
            )

        except (User.DoesNotExist, OTP.DoesNotExist):
            return Response(
                {"detail": "Invalid email or OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ResendOTP(APIView):
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)

            if user.is_active:
                return Response(
                    {"detail": "This email has been verified"},
                    status.HTTP_400_BAD_REQUEST,
                )

            OTP.objects.filter(user=user).delete()

            otp = OTP.objects.create(
                user=user,
                expires_at=timezone.now() + timezone.timedelta(minutes=5),
                purpose=OTP.verification_purpose,
            )
            send_verification_email(user, otp)
            return Response(
                {
                    "detail": "If an account with this email exists, an OTP has been sent."
                },
                status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {
                    "detail": "If an account with this email exists, an OTP has been sent."
                },
                status.HTTP_200_OK,
            )


class ForgetPassword(APIView):
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                return Response(
                    {
                        "detail": "If an account with this email exists, an OTP has been sent."
                    },
                    status.HTTP_200_OK,
                )
            OTP.objects.filter(
                user=user,
                purpose=OTP.reset_password_purpose,
            ).delete()

            otp = OTP.objects.create(
                user=user,
                purpose=OTP.reset_password_purpose,
                expires_at=timezone.now() + timezone.timedelta(minutes=5),
            )
            send_reset_password_otp(user, otp)
            return Response(
                {
                    "detail": "If an account with this email exists, an OTP has been sent."
                },
                status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {
                    "detail": "If an account with this email exists, an OTP has been sent."
                },
                status.HTTP_200_OK,
            )


class ResetPassword(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        otp = serializer.validated_data["otp"]



        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(
                user=user, otp_code=otp, purpose=OTP.reset_password_purpose
            )
            if timezone.now() > otp.expires_at:
                otp.delete()
                return Response(
                    {"detail": "OTP has expired. Please request a new  code."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(password)
            user.save()
            otp.delete()
            return Response(
                {"detail": "Your password has been reset successfully."},
                status=status.HTTP_200_OK,
            )

        except (User.DoesNotExist, OTP.DoesNotExist):
            return Response(
                {"detail": "Invalid email or OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )
