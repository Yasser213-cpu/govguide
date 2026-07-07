from rest_framework import serializers
from ai_agents.models import AISession


class AISessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AISession
        fields = [
            "id",
            "message",
            "answer",
            "intent",
            "tokens_used",
            "created_at",
        ]


class ChatRequestSerializer(serializers.Serializer):
    """Validates the incoming chat message."""
    message = serializers.CharField(max_length=1000)


class ChatResponseSerializer(serializers.Serializer):
    """Shapes the outgoing response."""
    intent = serializers.CharField()
    answer = serializers.CharField()
    
class RecommendRequestSerializer(serializers.Serializer):
    procedure_id = serializers.IntegerField()
    governorate = serializers.CharField(max_length=100, required=False, allow_blank=True)

class RecommendedCompanySerializer(serializers.Serializer):
    company_id = serializers.IntegerField(source="company.id")
    company_name = serializers.CharField(source="company.name")
    governorate = serializers.CharField(source="company.governorate")
    city = serializers.CharField(source="company.city")
    price = serializers.DecimalField(source="company_service_fee", max_digits=10, decimal_places=2)
    estimated_days = serializers.IntegerField(source="estimated_completion_days")
    score = serializers.FloatField()
    logo = serializers.ImageField(source="company.logo", read_only=True)