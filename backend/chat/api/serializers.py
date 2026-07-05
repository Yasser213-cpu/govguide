from rest_framework import serializers

from users.models import User
from chat.models import Conversation, Message
from companies.models import Company


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "id",
            "sender",
            "sender_name",
            "content",
            "is_read",
            "created_at",
            "is_me",
        )

    def get_is_me(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return obj.sender_id == user.id

class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField()

    def validate_content(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Message content cannot be empty."
            )

        return value

class CreateConversationSerializer(serializers.Serializer):
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
    )

class ConversationSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            "id",
            "company",
            "company_logo",
            "display_name",
            "last_message",
            "last_message_time",
            "unread_count",
            "created_at",
            "updated_at",
        )

    def get_company_logo(self, obj):
        request = self.context.get("request")

        if not obj.company or not obj.company.logo:
            return None

        url = obj.company.logo.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_display_name(self, obj):
        request = self.context["request"]

        if request.user.role == User.COMPANY_ROLE:
            return obj.client.get_full_name() or obj.client.email

        return obj.company.name

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        return last_msg.content if last_msg else None

    def get_last_message_time(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        return last_msg.created_at if last_msg else None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_authenticated", False):
            return 0

        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()