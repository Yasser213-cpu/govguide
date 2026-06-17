from django.db import models
from users.models import User
from django.core.validators import MinLengthValidator, RegexValidator, MinValueValidator
from procedures.models import Procedure


# Create your models here.
class Company(models.Model):

    phone_validator = RegexValidator(
        regex=r"^\+?\d{7,15}$",
        message="Phone number must contain 7 to 15 digits and may start with +.",
    )

    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="company")
    name = models.CharField(max_length=100, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    phone = models.CharField(
        max_length=15, null=False, blank=False, validators=[phone_validator]
    )
    governorate = models.CharField(max_length=100, null=False, blank=False)
    city = models.CharField(max_length=100, null=False, blank=False)
    street = models.CharField(max_length=100, null=False, blank=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"


class CompanyService(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="services"
    )
    procedure = models.ForeignKey(
        Procedure, on_delete=models.CASCADE, related_name="company_offerings"
    )

    company_service_fee = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)]
    )
    estimated_completion_days = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("company", "procedure")
        ordering = ["company_service_fee"]

    def __str__(self):
        return f"{self.company.name} - {self.procedure.name}"
