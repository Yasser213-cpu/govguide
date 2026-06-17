from django.urls import path
from . import views

urlpatterns = [
    path("", views.CompanyServices.as_view()),
    path("<int:id>", views.CompanyServices.as_view()),
]
