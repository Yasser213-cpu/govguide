from celery import shared_task


@shared_task
def add(x, y):
    """A simple test task to verify Celery is working."""
    return x + y