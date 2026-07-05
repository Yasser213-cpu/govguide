from django.conf import settings
from django.db import models

from companies.models import Company


class Conversation(models.Model):
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations",
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="conversations",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("client", "company")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.client.email} ↔ {self.company.name}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )

    content = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message #{self.id}"