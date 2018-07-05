import logging
from django.conf import settings
from django.db import models
from django.db.models.signals import post_save

# Create your models here.
logger = logging.getLogger(__name__)


class MarketingPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL)
    suscribed = models.BooleanField(default=True)
    mailchimp_msg = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.email


def marketing_pref_update_receiver(sender, instance, created, *args, **kwargs):
    if created:
        logger.info("Add user to mailchimp")
        pass


post_save.connect(marketing_pref_update_receiver, sender=MarketingPreference)


def make_marketing_pref_receiver(sender, instance, created, *args, **kwargs):
    '''
    User model
    '''
    if created:
        MarketingPreference.objects.get_or_create(user=instance)


post_save.connect(make_marketing_pref_receiver, sender=settings.AUTH_USER_MODEL)
