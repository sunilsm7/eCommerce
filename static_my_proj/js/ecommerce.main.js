$(document).ready(function(){
  const stripeFormModule = $(".stripe-payment-form");
  const stripeModuleToken = stripeFormModule.attr("data-token");
  const stripeModuleNextUrl = stripeFormModule.attr("data-next-url");
  const stripeModuleBtnTitle = stripeFormModule.attr("data-btn-title") || "Add card";

  const stripeTemplate =  $.templates("#stripeTemplate");
  let stripeTemplateDataContext = {
    publishKey: stripeModuleToken,
    nextUrl: stripeModuleNextUrl,
    btnTitle: stripeModuleBtnTitle
  }

  let stripeTemplateHtml = stripeTemplate.render(stripeTemplateDataContext);
  stripeFormModule.html(stripeTemplateHtml);

  // https secure site when live

  const paymentForm = $(".payment-form");
  if(paymentForm.length > 1) {
    $.alert("Only one payment form is allowed per page");
    paymentForm.css('display', 'none');
  } else if (paymentForm.length === 1) {
    const pubKey = paymentForm.attr('data-token');
    const nextUrl = paymentForm.attr('data-next-url');
    // Create a Stripe client
    const stripe = Stripe(pubKey);

    // Create an instance of Elements
    let elements = stripe.elements();
    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    const style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element
    const card = elements.create('card', {style: style});
    // Add an instance of the card Element into the `card-element` <div>
    card.mount('#card-element');
    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function(event) {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    // Handle form submission
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      stripe.createToken(card).then(function(result) {
        if (result.error) {
          // Inform the user if there was an error
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // Send the token to your server
          stripeTokenHandler(nextUrl, result.token);
        }
      });
    });

    function redirectToNext(nextPath, timeoffset) {
      if (nextPath) {
        setTimeout(function() {
          window.location.href = nextPath
        }, timeoffset)
      }
    }

    function stripeTokenHandler(nextUrl, token){
        // console.log(token.id)
        let paymentMethodEndpoint = '/billing/payment-method/create/';
        let data = {
          'token': token.id
        };

        $.ajax({
          data: data,
          url: paymentMethodEndpoint,
          method: "POST",
          success: function(data) {
            console.log(data);
            const successMsg = data.message || "Success! Your card was added.";
            card.clear();

            if(nextUrl) {
              successMsg = successMsg + "<br/><br/><i class='fa fa-spin fa-spinner></i>Redrirecting....";
            } 
            if ($.alert) {
              $.alert(successMsg);
            } else {
              alert(successMsg);
            }
            redirectToNext(nextUrl, 1500);
          },
          error: function(error) {
            console.log(error)
          }
      });
    }
  }
});
