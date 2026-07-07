from django.urls import path
from .views import ChatView , RecommendCompaniesView, CompanyInsightsView
from .views import ChatHistoryView


urlpatterns = [
    path("chat/", ChatView.as_view(),name="ai_chat"),
    path("recommend-companies/", RecommendCompaniesView.as_view(), name="recommend-companies"),
    path("company-insights/<int:procedure_id>", CompanyInsightsView.as_view()),
    path("chat-history/", ChatHistoryView.as_view()),
]
