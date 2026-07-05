from django.urls import path

from .views import (
    ConversationListCreateView,
    MessageListCreateView,
    MarkAsReadAPIView,
)

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path(
        "conversations/",
        ConversationListCreateView.as_view(),
        name="conversation-list-create",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        MessageListCreateView.as_view(),
        name="conversation-messages",
    ),
    path("conversations/<int:conversation_id>/read/", MarkAsReadAPIView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)