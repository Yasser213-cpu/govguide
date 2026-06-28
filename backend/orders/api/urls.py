from django.urls import path
from . import views
from reviews.api.views import ReviewAPIView

urlpatterns = [
    path("", views.ClientOrdersAPIView.as_view()),
    path("<int:id>", views.ClientOrdersAPIView.as_view()),
    path("<int:id>/documents", views.UploadOrderDocument.as_view()),
    path(
        "<int:pk>/status/",
        views.OrderStatusAPIView.as_view(),
    ),
    path("<int:id>/pay", views.PayOrderAPIView.as_view()),
    path("<int:id>/timeline", views.OrderStatusHistoryAPIView.as_view()),
    path("<int:id>/review", ReviewAPIView.as_view()),
]
