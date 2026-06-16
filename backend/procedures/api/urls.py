from django.urls import path
from . import views



urlpatterns = [
    path("" , views.ProceduresAPIView.as_view() ),
    path("<int:id>" , views.ProceduresAPIView.as_view() )

]