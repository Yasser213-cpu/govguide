from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..models import AISession

from .serializers import ChatRequestSerializer
from ai_agents.rag.pipeline import handle_message


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # 1. Validate the incoming message
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]

        # 2. Run the AI pipeline (with error handling)
        try:
            result = handle_message(message)
        except Exception as e:
            return Response(
                {"error": "AI service is temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        if request.user.is_authenticated:
            AISession.objects.create(
                user=request.user,
                message=message,
                answer=result["answer"],
                intent=result.get("intent", ""),
                tokens_used=result.get("tokens", 0),

            )


        # 3. Return the result
        return Response(result, status=status.HTTP_200_OK)