import uuid

from django.db.models import Count, Max, Min, OuterRef, Subquery
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from ..models import AISession
from .serializers import (
    ChatRequestSerializer,
    RecommendedCompanySerializer,
    RecommendRequestSerializer,
    ChatSessionListSerializer,
    AISessionDetailSerializer,
)
from ai_agents.rag.pipeline import handle_message
from ..recommendation import recommend_companies
from core.permissions import isCompanyOwner
from rest_framework.permissions import IsAuthenticated
from ai_agents.company_insights import analyze_company, build_advice


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        first_message = AISession.objects.filter(
            session_id=OuterRef("session_id"),
            user=request.user,
        ).order_by("created_at").values("message")[:1]

        queryset = (
            AISession.objects.filter(user=request.user)
            .values("session_id")
            .annotate(
                preview=Subquery(first_message),
                message_count=Count("id"),
                started_at=Min("created_at"),
                last_message_at=Max("created_at"),
            )
            .order_by("-last_message_at")
        )

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ChatSessionListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class ChatSessionMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        messages = AISession.objects.filter(
            user=request.user,
            session_id=session_id,
        ).order_by("created_at")

        if not messages.exists():
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AISessionDetailSerializer(messages, many=True)
        return Response(serializer.data)


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # 1. Validate the incoming message
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        session_id = serializer.validated_data.get("session_id")
        if session_id is None:
            session_id = uuid.uuid4()

        # 2. Run the AI pipeline (with error handling)
        try:
            result = handle_message(message)
        except Exception:
            return Response(
                {"error": "AI service is temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        if request.user.is_authenticated:
            AISession.objects.create(
                user=request.user,
                session_id=session_id,
                message=message,
                answer=result["answer"],
                intent=result.get("intent", ""),
                tokens_used=result.get("tokens", 0),
            )

        result["session_id"] = str(session_id)

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
