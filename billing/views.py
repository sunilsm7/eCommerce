import logging
import stripe
from django.shortcuts import render
# Create your views here.

logger = logging.getLogger(__name__)
stripe.api_key = "sk_test_0bfLJF5yaMsFBrcGsCYsVWnP"
STRIPE_PUB_KEY = 'pk_test_bfLAv5Zn1FE5sa7hQepI4BOG'


def payment_method_view(request):
    if request.method == 'POST':
        logger.info(request.POST)
    return render(request, 'billing/payment-method.html', {'publish_key': STRIPE_PUB_KEY})
