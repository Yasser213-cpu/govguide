import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.db import database_sync_to_async
from .models import Message, Conversation
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
from .services import create_chat_notification

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"

        query_string = self.scope["query_string"].decode()
        token = parse_qs(query_string).get("token")

        if not token:
            await self.close()
            return

        user = await self.get_user(token[0])

        if not user:
            await self.close()
            return

        self.user = user

        # 🔐 NEW: permission check
        is_allowed = await self.is_allowed_user()

        if not is_allowed:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message")

        conversation = await database_sync_to_async(
            Conversation.objects.select_related("client", "company__owner").get
        )(id=self.conversation_id)

        msg_obj = await database_sync_to_async(Message.objects.create)(
            conversation=conversation,
            sender=self.user,
            content=message
        )
    
        await self.create_notification(conversation, msg_obj)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": msg_obj.content,
                "sender_id": self.user.id,
                "sender_name": self.user.get_full_name() or self.user.username,
                "message_id": msg_obj.id,
                "conversation_id": conversation.id,
                "created_at": msg_obj.created_at.isoformat(),
                "is_read": msg_obj.is_read,
            }
        )

    @database_sync_to_async
    def create_notification(self, conversation, msg_obj):
        receiver = (
            conversation.company.owner
            if conversation.client_id == self.user.id
            else conversation.client
        )

        create_chat_notification(
            sender=self.user,
            receiver=receiver,
            conversation=conversation,
            message=msg_obj,
        )

    async def chat_message(self, event):
        print("📡 SENDING WS MESSAGE:", event)
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender_id": event["sender_id"],
            "sender_name": event.get("sender_name", "User"),
            "message_id": event["message_id"],
            "conversation_id": event.get("conversation_id"),
            "created_at": event.get("created_at"),
            "is_read": event.get("is_read", False),
        }))

    @database_sync_to_async
    def get_user(self, token):
        try:
            validated_token = JWTAuthentication().get_validated_token(token)
            return JWTAuthentication().get_user(validated_token)
        except Exception:
            return None

    @database_sync_to_async
    def is_allowed_user(self):
        try:
            conversation = Conversation.objects.select_related("company__owner").get(id=self.conversation_id)

            if conversation.client_id == self.user.id:
                return True

            if conversation.company.owner_id == self.user.id:
                return True

            return False

        except Conversation.DoesNotExist:
            return False