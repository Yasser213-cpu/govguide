from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from chat.services import create_chat_notification
from chat.models import Conversation, Message
from chat.api.serializers import (
    ConversationSerializer,
    CreateConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
)
class ConversationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == User.CLIENT_ROLE:
            conversations = Conversation.objects.filter(client=request.user)
        else:
            user = request.user

            if not hasattr(user, "company"):
                return Response([], status=200)
            conversations = Conversation.objects.filter(company=user.company)

        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateConversationSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        company = serializer.validated_data["company"]

        conversation, created = Conversation.objects.get_or_create(
            client=request.user,
            company=company,
        )

        response_serializer = ConversationSerializer(
            conversation,
            context={"request": request},
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_conversation(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        user = request.user
        user_company = getattr(user, "company", None)

        is_client = conversation.client == user
        is_company = user_company and conversation.company == user_company

        if not (is_client or is_company):
            raise PermissionDenied("You don't have access to this conversation.")

        return conversation

    def get(self, request, conversation_id):
        conversation = self.get_conversation(request, conversation_id)

        messages = conversation.messages.select_related("sender").order_by("created_at")

        serializer = MessageSerializer(
            messages,
            many=True,
            context={"request": request}
        )
        response_data = serializer.data 

        Message.objects.filter(
            conversation=conversation, is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        return Response(response_data)

    def post(self, request, conversation_id):
        conversation = self.get_conversation(request, conversation_id)

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=serializer.validated_data["content"],
        )

        receiver = (
            conversation.company.owner
            if request.user.role == "client"
            else conversation.client
        )

        create_chat_notification(
            sender=request.user,
            receiver=receiver,
            conversation=conversation,
            message=message,
        )

        conversation.updated_at = timezone.now()
        conversation.save(update_fields=["updated_at"])

        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )


class MarkAsReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        if request.user not in [conversation.client, conversation.company.owner]:
            raise PermissionDenied()

        Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(
            sender=request.user
        ).update(is_read=True)

        return Response({"detail": "marked as read"})
