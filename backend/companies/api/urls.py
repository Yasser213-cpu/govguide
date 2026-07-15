from django.urls import path
from . import views

urlpatterns = [
    path("", views.CompanyAPIView.as_view()),
    path("<int:id>", views.CompanyAPIView.as_view()),
    path("<int:id>/services", views.CompanyServiceDetails.as_view()),
    path("<int:id>/reviews" , views.CompanyReviewsAPIView.as_view()),
    path("stripe/onboarding/", views.CompanyStripeOnboardingAPIView.as_view()),
    path("stripe/status/", views.CompanyStripeStatusAPIView.as_view()),
    path("balance/", views.CompanyBalanceAPIView.as_view()),
]
