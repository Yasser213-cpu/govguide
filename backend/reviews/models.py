from django.db import models
from orders.models import Order
from companies.models import Company
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.


class Review(models.Model):
    order = models.OneToOneField(
        Order, related_name="order_review", on_delete=models.CASCADE
    )
    comment = models.CharField(max_length=200, blank=True, null=True)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator, MaxValueValidator]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
