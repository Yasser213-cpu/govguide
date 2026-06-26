from django.db import models

# Create your models here.


class Requirement(models.Model):
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title}"


class Procedure(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=500, null=False, blank=False)
    estimated_government_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    estimated_processing_days = models.PositiveIntegerField(blank=True, null=True)
    government_authority = models.CharField(
        max_length=200,
        blank=True,
    )
    requirements = models.ManyToManyField(
        Requirement, related_name="procedures", blank=True
    )

    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"
