import logging
import stripe
from django.conf import settings
from django.db import models
from django.db.models.signals import post_save, pre_save
from accounts.models import GuestEmail
# Create your models here.

logger = logging.getLogger(__name__)

User = settings.AUTH_USER_MODEL

stripe.api_key = "sk_test_0bfLJF5yaMsFBrcGsCYsVWnP"


class BillingProfileManager(models.Manager):
    def new_or_get(self, request):
        user = request.user
        guest_email_id = request.session.get('guest_email_id')
        created = False
        obj = None
        if user.is_authenticated():
            """logged in user checkout; auto remember payment stuff"""
            obj, created = self.model.objects.get_or_create(user=user, email=user.email)
        elif guest_email_id is not None:
            """guest user checkout; auto reloads payment stuff"""
            guest_email_obj = GuestEmail.objects.get(id=guest_email_id)
            obj, created = self.model.objects.get_or_create(email=guest_email_obj.email)
        else:
            pass
        return obj, created


class BillingProfile(models.Model):
    user = models.OneToOneField(User, null=True, blank=True)
    email = models.EmailField()
    active = models.BooleanField(default=True)
    update = models.DateTimeField(auto_now=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    customer_id = models.CharField(max_length=120, null=True, blank=True)
    # customer_id in Stripe or Braintree

    objects = BillingProfileManager()

    def __str__(self):
        return self.email


def billing_profile_created_receiver(sender, instance, *args, **kwargs):
    if not instance.customer_id and instance.email:
        logger.warning("ACTUAL API REQUEST Send to stripe")
        customer = stripe.Customer.create(
            email=instance.email
        )
        logger.warning('customer {}'.format(customer))
        instance.customer_id = customer.id


pre_save.connect(billing_profile_created_receiver, sender=BillingProfile)


def user_created_receiver(sender, instance, created, *args, **kwargs):
    logger.warning('in billing_profile_created_receiver')
    if created and instance.email:
        logger.warning('creating user profile')
        BillingProfile.objects.get_or_create(user=instance, email=instance.email)


post_save.connect(user_created_receiver, sender=User)


class Card(models.Model):
    pass
