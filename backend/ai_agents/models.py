from django.db import models
from django.conf import settings

class AISession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_sessions"
    )
    message = models.TextField()
    answer = models.TextField()
    intent = models.CharField(max_length=50, blank=True)
    tokens_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.created_at}"