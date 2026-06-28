"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("users.api.urls")),
    path("api/v1/companies/", include("companies.api.urls")),
    path("api/v1/procedures/", include("procedures.api.urls")),
    path("api/v1/services/", include("companies.api.services_urls")),
    path("api/v1/ai/", include("ai_agents.api.urls")),
    path("api/v1/available-slots/", include("bookings.api.slots_urls")),
    path("api/v1/orders/", include("orders.api.urls")),
    path("api/v1/company/", include("orders.api.url_company_orders")),
    path("api/v1/notifications/", include("notifications.api.urls")),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
