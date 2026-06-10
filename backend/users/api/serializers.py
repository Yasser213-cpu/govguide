from rest_framework import serializers
from django.core.validators import RegexValidator
from ..models import User 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from companies.models import Company



class RegistrationSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[User.CLIENT_ROLE,User.COMPANY_ROLE])
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


    username = serializers.CharField(validators=[username_validator])
    password = serializers.CharField(validators=[password_validator])


    def validate_username(self , value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("username already exist")
        return value ; 


    def create(self,validated_data):
        username=validated_data["username"]
        password = validated_data["password"]
        role=validated_data["role"]
        user = User.objects.create_user(username=username, password=password , role=role)
        return user



class RegisterCompanySerializer(RegistrationSerializer):
    name = serializers.CharField(max_length=100)
    description= serializers.CharField()
    phone= serializers.CharField(max_length=15)
    city = serializers.CharField(max_length=100)
    street = serializers.CharField(max_length=100)
    governorate = serializers.CharField(max_length=100)

    def create(self, validated_data):
     name = validated_data.pop("name")
     description = validated_data.pop("description")
     phone = validated_data.pop("phone")
     governorate = validated_data.pop("governorate")
     city = validated_data.pop("city")
     street = validated_data.pop("street")

     user = super().create(validated_data)

     Company.objects.create(
        owner=user,
        name=name,
        description=description,
        phone=phone,
        governorate=governorate,
        city=city,
        street=street
     )

     return user




class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role

        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)

        data["role"] = self.user.role

        return data