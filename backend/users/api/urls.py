from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView ,TokenRefreshView
from . import views 



urlpatterns = [
    path("token",views.MyTokenObtainPairView.as_view()),
    path("token/refresh",TokenRefreshView.as_view() ),
    path("register/client" ,  views.RegisterAPIView.as_view() ),
    path("verify" ,views.VerifyEmail.as_view()),
    path("resend-otp" , views.ResendOTP.as_view()),
    path("forget-password" , views.ForgetPassword.as_view()),
    path("reset-password" , views.ResetPassword.as_view())
]