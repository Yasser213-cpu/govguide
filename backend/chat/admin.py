from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "company",
        "updated_at",
    )

    search_fields = (
        "client__email",
        "company__name",
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "sender",
        "is_read",
        "created_at",
    )

    list_filter = (
        "is_read",
    )

    search_fields = (
        "sender__email",
        "conversation__company__name",
    )