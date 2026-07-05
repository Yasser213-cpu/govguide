from django.db import models
from django.conf import settings


class Notification(models.Model):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    PAID = "paid"
    COMPLETED = "completed"
    CHAT_MESSAGE = "chat_message"
    NEW_ORDER = "new_order"
    REVIEW = "review"

    TYPE_CHOICES = [
        (ACCEPTED, "Accepted"),
        (REJECTED, "Rejected"),
        (PAID, "Paid"),
        (COMPLETED, "Completed"),
        (CHAT_MESSAGE, "Chat Message"),
        (NEW_ORDER, "New Order"),
        (REVIEW, "Review"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.notification_type} -> {self.user}"