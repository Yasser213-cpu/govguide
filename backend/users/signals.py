from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import User , OTP
from django.utils import timezone
from core.services import send_verification_email




@receiver(sender=User , signal=post_save)
def create_OTP(sender , instance , created , **kwargs):
    if instance.is_superuser:
        pass

    if created:
        otp = OTP.objects.create(user=instance , expires_at=  timezone.now() + timezone.timedelta(minutes=5) , purpose=OTP.verification_purpose)
        send_verification_email(instance,otp)



