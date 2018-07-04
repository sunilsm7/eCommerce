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
    const form = $('#payment-form');
    const btnLoad = form.find(".btn-load");
    let btnLoadDefaultHtml = btnLoad.html();
    let btnLoadDefaultClasses = btnLoad.attr("class");

    form.on('submit', function(event) {
      event.preventDefault();
      // get the btn
      // display new btn ui
      let $this =  $(this);
      btnLoad.blur();

      let loadTime = 1500;
      let currentTimeout;
      let errorHtml = "<i class=fa fa-warning></i> An error occured";
      let errorClasses = "btn btn-danger disabled my-3";
      let loadingHtml = "<i class='fa fa-spin fa-spinner'></i> Loading...";
      let loadingClasses = "btn btn-success disabled my-3";

      stripe.createToken(card).then(function(result) {
        if (result.error) {
          // Inform the user if there was an error
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
          currentTimeout = displayBtnStatus(btnLoad, errorHtml, errorClasses, 1000, currentTimeout);

        } else {
          // Send the token to your server
          currentTimeout = displayBtnStatus(btnLoad, loadingHtml, loadingClasses, 10000, currentTimeout);
          stripeTokenHandler(nextUrl, result.token);
        }
      });

    });


    function displayBtnStatus(element, newHtml,newClasses, loadTime, timeout) {
      // if (timeout) {
      //   clearTimeout(timeout)
      // }

      if (!loadTime) {
        loadTime = 1500;
      }

      // let defaultHtml = element.html();
      // let btnLoadDefaultClasses = element.attr("class");

      element.html(newHtml);
      element.removeClass(btnLoadDefaultClasses);
      element.addClass(newClasses);
      return setTimeout(function() {
          element.html(btnLoadDefaultHtml);
          element.removeClass(newClasses);
          element.addClass(btnLoadDefaultClasses)
      }, loadTime);
    }


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
            let successMsg = data.message || "Success! Your card was added.";
            card.clear();

            if(nextUrl) {
              successMsg = successMsg + "<br/><br/><i class='fa fa-spin fa-spinner'></i>Redirecting...";
            } 
            if ($.alert) {
              $.alert(successMsg);
            } else {
              alert(successMsg);
            }
            btnLoad.html(btnLoadDefaultHtml);
            btnLoad.attr('class', btnLoadDefaultClasses);
            redirectToNext(nextUrl, 1500);
          },
          error: function(error) {
            console.log(error);
            $.alert({title: "An error occured", content:"Please try adding your card again."});
            btnLoad.html(btnLoadDefaultHtml);
            btnLoad.attr('class', btnLoadDefaultClasses);
          }
      });
    }
  }
});
