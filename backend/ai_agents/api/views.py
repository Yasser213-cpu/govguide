from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..models import AISession
from .serializers import ChatRequestSerializer,RecommendedCompanySerializer,RecommendRequestSerializer
from ai_agents.rag.pipeline import handle_message
from ..recommendation import recommend_companies
from core.permissions import isCompanyOwner
from rest_framework.permissions import IsAuthenticated
from ai_agents.company_insights import analyze_company, build_advice
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from ai_agents.models import AISession
from .serializers import AISessionSerializer


class ChatHistoryView(ListAPIView):
    serializer_class = AISessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only the logged-in user's own chat history, newest first
        return AISession.objects.filter(user=self.request.user).order_by("-created_at")



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



class RecommendCompaniesView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        request_serializer = RecommendRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        procedure_id = request_serializer.validated_data["procedure_id"]
        governorate = request_serializer.validated_data.get("governorate")
        if not governorate and request.user.is_authenticated:
            governorate = request.user.governorate or None

        results = recommend_companies(procedure_id, user_governorate=governorate)

        
        output_serializer = RecommendedCompanySerializer(results, many=True)

        return Response(
            {"procedure_id": procedure_id, "results": output_serializer.data},
            status=status.HTTP_200_OK,
        )
class CompanyInsightsView(APIView):
    def get_permissions(self):
        return [IsAuthenticated(), isCompanyOwner()]

    def get(self, request, procedure_id):
        company = getattr(request.user, "company", None)
        if company is None:
            return Response(
                {"error": "هذا الحساب غير مرتبط بشركة"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        analysis = analyze_company(company.id, procedure_id)
        advice = build_advice(analysis)
        return Response(advice, status=status.HTTP_200_OK)
