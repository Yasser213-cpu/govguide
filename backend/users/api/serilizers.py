from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import RegexValidator



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


    username = serializers.CharField(validators=[username_validator])
    password = serializers.CharField(validators=[password_validator])


    def validate_username(self , value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("username already exist")
        return value ; 


    def create(self,validated_data):
        username=validated_data["username"]
        password = validated_data["password"]
        user = User.objects.create_user(username=username, password=password)
        return user
