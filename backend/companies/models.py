from django.db import models
from users.models import User
from django.core.validators import MinLengthValidator ,RegexValidator

# Create your models here.
class Company(models.Model):

    phone_validator = RegexValidator(
        regex=r'^\+?\d{7,15}$',
        message='Phone number must contain 7 to 15 digits and may start with +.'
    )




    owner = models.ForeignKey(User , on_delete=models.CASCADE ,related_name="company")
    name= models.CharField(max_length=100  ,null=False , blank=False)
    description = models.TextField(null=False , blank=False)
    phone = models.CharField(max_length=15, null=False , blank=False ,validators=[phone_validator])
    governorate = models.CharField(max_length=100 , null=False , blank=False )
    city = models.CharField(max_length=100 , null=False , blank=False )
    street = models.CharField(max_length=100 , null=False , blank=False )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"

