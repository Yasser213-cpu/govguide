from django.db import models
from companies.models import Company

# Create your models here.


class AvailabilitySlot(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="availability_slots"
    )
    date = models.DateField(null=False, blank=False)
    start_time = models.TimeField(null=False, blank=False)
    end_time = models.TimeField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["company", "date", "start_time", "end_time"],
                name="unique_company_slot",
            )
        ]
