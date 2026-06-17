from django.urls import path
from . import views

urlpatterns = [
    path("", views.CompanyAPIView.as_view()),
    path("<int:id>", views.CompanyAPIView.as_view()),
]
