from django.urls import path
from . import views

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
]
