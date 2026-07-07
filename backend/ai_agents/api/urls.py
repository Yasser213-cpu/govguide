from django.urls import path
from .views import (
    ChatView,
    RecommendCompaniesView,
    CompanyInsightsView,
    ChatHistoryView,
    ChatSessionMessagesView,
)


urlpatterns = [
    path("chat/", ChatView.as_view(), name="ai_chat"),
    path("recommend-companies/", RecommendCompaniesView.as_view(), name="recommend-companies"),
    path("company-insights/<int:procedure_id>", CompanyInsightsView.as_view()),
    path("chat-history/", ChatHistoryView.as_view()),
    path("chat-history/<uuid:session_id>/", ChatSessionMessagesView.as_view()),
]
