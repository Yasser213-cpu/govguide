from rest_framework import serializers
from ..models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from companies.models import Company
from .services import password_validator
from django.core.validators import RegexValidator
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken


class RegistrationSerializer(serializers.Serializer):
    username_validator = RegexValidator(
        regex=r"^[a-zA-Z][a-zA-Z0-9_]{2,29}$",
        message=(
            "Username must start with a letter and contain only letters, "
            "numbers, and underscores. It must be between 3 and 30 characters long."
        ),
    )

    role = serializers.ChoiceField(choices=[User.CLIENT_ROLE, User.COMPANY_ROLE])
    email = serializers.EmailField()
    username = serializers.CharField(validators=[username_validator])
    password = serializers.CharField(validators=[password_validator])

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("username already exist")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        username = validated_data["username"]
        password = validated_data["password"]
        role = validated_data["role"]
        user = User.objects.create_user(
            email=email, username=username, password=password, role=role
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if hasattr(user, "company"):
            token["company_id"] = user.company.id

        token["role"] = user.role

        return token

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]

        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if not user:
            raise AuthenticationFailed(detail={"detail": "Invalid email or password"})

        if not user.is_verified:
            raise serializers.ValidationError(
                {
                    "detail": "Please verify your email before logging in.",
                    "next_step": "verify_email",
                }
            )
        self.user = user

        token = self.get_token(user)

        data = {
            "refresh": str(token),
            "access": str(token.access_token),
            "role": user.role,
        }

        if user.role == User.COMPANY_ROLE:
            data["next_step"] = (
                "dashboard" if hasattr(user, "company") else "create_company"
            )
        else:
            data["next_step"] = "home"

        return data


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class verfiyEmailSerializer(EmailSerializer):
    otp = serializers.CharField(max_length=6)


class ResetPasswordSerializer(verfiyEmailSerializer):
    password = serializers.CharField(validators=[password_validator])


class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]
