from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    CLIENT_ROLE = "client"
    COMPANY_ROLE = "company"
    ROLE_CHOICES=[
        (CLIENT_ROLE,"Client"),
        (COMPANY_ROLE,"Company")
    ]
    role = models.CharField(choices=ROLE_CHOICES , max_length=20)


