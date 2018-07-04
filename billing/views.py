import logging
import stripe
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.utils.http import is_safe_url
# Create your views here.

logger = logging.getLogger(__name__)
stripe.api_key = "sk_test_0bfLJF5yaMsFBrcGsCYsVWnP"
STRIPE_PUB_KEY = 'pk_test_bfLAv5Zn1FE5sa7hQepI4BOG'


def payment_method_view(request):
    next_url = None
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
        logger.warning(request.POST)
        return JsonResponse({'message': "Success! Your card was added."})
    logger.error(request.GET)
    return HttpResponse("error", status=401)
