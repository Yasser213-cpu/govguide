from django.urls import path
from . import views

urlpatterns = [
    path("", views.RequirementsAPIView.as_view()),
    path("<int:id>", views.RequirementsAPIView.as_view())
]