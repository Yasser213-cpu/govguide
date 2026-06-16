import os
from celery import Celery

# Tell Celery where Django's settings are
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Create the Celery app
app = Celery("config")

# Load config from Django settings, using keys that start with "CELERY_"
app.config_from_object("django.conf:settings", namespace="CELERY")

# Automatically find tasks.py files in all installed apps
app.autodiscover_tasks()