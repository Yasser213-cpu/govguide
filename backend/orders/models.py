from django.db import models

from users.models import User
from companies.models import CompanyService
from procedures.models import Requirement


class Order(models.Model):
    PENDING_STATUS = "pending"
    ACCEPTED_STATUS = "accepted"
    REJECTED_STATUS = "rejected"
    PAID_STATUS = "paid"
    IN_PROGRESS_STATUS = "in_progress"
    COMPLETED_STATUS = "completed"

    STATUS_CHOICES = [
        (PENDING_STATUS, "Pending"),
        (ACCEPTED_STATUS, "Accepted"),
        (REJECTED_STATUS, "Rejected"),
        (PAID_STATUS, "Paid"),
        (IN_PROGRESS_STATUS, "In Progress"),
        (COMPLETED_STATUS, "Completed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    service = models.ForeignKey(
        CompanyService,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING_STATUS,
    )

    notes = models.TextField(blank=True)

    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:

        ordering = ["-created_at"]

    @property
    def company(self):
        return self.service.company

    @property
    def procedure(self):
        return self.service.procedure

    def __str__(self):
        return f"Order #{self.pk} - {self.status}"


class Document(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="documents")
    requirement = models.ForeignKey(Requirement, on_delete=models.SET_NULL, null=True)

    file = models.FileField(upload_to="orders/documents/", null=False, blank=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    extracted_text = models.TextField(blank=True)
    ocr_confidence = models.FloatField(null=True, blank=True)
    ocr_status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("done", "Done"),
            ("failed", "Failed"),
        ],
        default="pending",
    )
    needs_review = models.BooleanField(default=False)
    verification_flags = models.JSONField(default=list, blank=True)

