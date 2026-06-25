from django.urls import path
from . import views

urlpatterns = [
    # company
    path("orders/", views.CompanyOrdersAPIView.as_view()),
    path("orders/<int:id>/", views.CompanyOrdersAPIView.as_view()),
]
