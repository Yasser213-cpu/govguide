from rest_framework import serializers
from django.core.validators import RegexValidator
from ..models import User 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from companies.models import Company



class RegistrationSerializer(serializers.Serializer):
    username_validator = RegexValidator(
    regex=r'^[a-zA-Z][a-zA-Z0-9_]{2,29}$',
    message=(
                  "Username must start with a letter and contain only letters, "
                  "numbers, and underscores. It must be between 3 and 30 characters long."
                ),
                ) 
    password_validator = RegexValidator(
          regex=r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$',
          message=(
                  "Password must be at least 8 characters long and contain at least "
                   "one uppercase letter, one lowercase letter, one digit, and one special character."
                  ),
           )
    role = serializers.ChoiceField(choices=[User.CLIENT_ROLE,User.COMPANY_ROLE])
    email = serializers.EmailField()
    username = serializers.CharField(validators=[username_validator])
    password = serializers.CharField(validators=[password_validator])


    def validate_username(self , value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("username already exist")
        return value ; 
    
    def validate_email(self, value):
     if User.objects.filter(email=value).exists():
        raise serializers.ValidationError("Email already exists")
     return value


    def create(self,validated_data):
        email=validated_data["email"]
        username=validated_data["username"]
        password = validated_data["password"]
        role=validated_data["role"]
        user = User.objects.create_user(email=email,username=username, password=password , role=role)
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role
       

        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        role = self.user.role

        data["role"] = role
        if role == User.COMPANY_ROLE:
            if hasattr(self.user, 'company'):
                data["next_step"]= "dashboard"
            else:
                data["next_step"]= "create_company"
        else:
           data["next_step"] = "home"

            


        return data