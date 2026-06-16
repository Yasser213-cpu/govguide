from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    """Validates the incoming chat message."""
    message = serializers.CharField(max_length=1000)


class ChatResponseSerializer(serializers.Serializer):
    """Shapes the outgoing response."""
    intent = serializers.CharField()
    answer = serializers.CharField()