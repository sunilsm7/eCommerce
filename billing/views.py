import logging
import stripe
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.utils.http import is_safe_url

from .models import BillingProfile, Card

# Create your views here.

logger = logging.getLogger(__name__)
stripe.api_key = "sk_test_0bfLJF5yaMsFBrcGsCYsVWnP"
STRIPE_PUB_KEY = 'pk_test_bfLAv5Zn1FE5sa7hQepI4BOG'


def payment_method_view(request):
    next_url = None
    # if request.user.is_authenticated():
    #     billing_profile = request.user.billing_profile
    #     my_customer_id = billing_profile.customer_id

    billing_profile, billing_profile_created = BillingProfile.objects.new_or_get(request)

    if not billing_profile:
        return redirect("/cart/")
    next_ = request.GET.get('next')
    if is_safe_url(next_, request.get_host()):
        next_url = next_

    context = {
        'publish_key': STRIPE_PUB_KEY,
        "next_url": next_url
    }
    return render(request, 'billing/payment-method.html', context)


def payment_method_createview(request):
    if request.method == 'POST' and request.is_ajax():
        billing_profile, billing_profile_created = BillingProfile.objects.new_or_get(request)
        if not billing_profile:
            return HttpResponse({'message': "Can not find this user"}, status_code=401)

        token = request.POST.get("token")
        if token is not None:
            new_card_obj = Card.objects.add_new(billing_profile, token)
            logger.warning(new_card_obj)
        return JsonResponse({'message': "Success! Your card was added."})
    return HttpResponse("error", status=401)
