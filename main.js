// creates desktop header by duplicating the header html
const header = document.querySelector('.header')
const deskopHeader = document.querySelector('.header-desktop')
deskopHeader.innerHTML = header.innerHTML

// navbar on scroll 
inView('.header')
  .on('enter', el => deskopHeader.classList.remove('visible'))
  .on('exit', el => deskopHeader.classList.add('visible'))

// tilt images
VanillaTilt.init(document.querySelectorAll('.image'), {
  max:25,
  speed:400
})

// images fade in on scroll
inView('.fade')
  .on('enter', img => img.classList.add('visible'))
  .on('exit', img => img.classList.remove('visible'))
  .on('enter', h1 => h1.classList.add('visible'))
  .on('exit', h1 => h1.classList.remove('visible'))


// register button .slide-up
const registerButton = document.querySelector('.register-button')
registerButton.addEventListener('click', event => {
  //stops any default actions happening
  event.preventDefault()
  const frontEl = document.querySelector('.front')
  frontEl.classList.add('slide-up')
})



// Stripe payment 


/* globals Stripe */
const stripe = Stripe('pk_test_cucWEL0zZ0Ttl8sDgYcAdeD6')

// Create an instance of Elements.
const elements = stripe.elements()

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
const style = {
  base: {
    color: '#32325d',
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
}

// pick the form
const form = document.querySelector('#payment-form')

// get the error tag
const errorEl = form.querySelector('#card-errors')

// get the inputs
const nameEl = form.querySelector('#name')
const emailEl = form.querySelector('#email')

// set up what happens with an error (pass in our own message)
const showErrors = msg => {
  if (msg) {
    errorEl.style.display = 'block'
    errorEl.innerHTML = msg
  } else {
    errorEl.style.display = 'none'
  }
}

// set up what happens with a stripe success
const showSuccess = () => {
  form.querySelector('.form-title').textContent = 'Payment successful!'
  form.querySelector('.form-fields').textContent = `Thank you ${nameEl.value}, your payment was successful and we have sent an email receipt to ${emailEl.value}`
}

// Create an instance of the card Stripe Element.
var card = elements.create('card', {style: style})

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element')

// and listen out for any changes, if an error, show it!
card.addEventListener('change', function(event) {
  if (event.error) {
    showErrors(event.error.message)
  } else {
    showErrors()
  }
})

// Handle form submission.
form.addEventListener('submit', function(event) {
  event.preventDefault()
  form.classList.add('processing')
  // create a new payment method in stripe
  stripe.createPaymentMethod('card', card).then(result => {
    // when stripe returns back...
    if (result.error) {
      // invalid card format
      showErrors(result.error.message)
    } else {
      // pass my payment method to the function below
      stripeHandle(result.paymentMethod)
    }
  })
})

// Submit the form with the payment method ID.
const stripeHandle = function(paymentMethod) {
  // where do i post ajax to?
  const backendUrl = form.getAttribute('action')

  fetch(backendUrl, {
    // fetch to POST to our url instead of GET
    method: 'POST',
    // type of data we are sending
    headers: {
      'Content-Type': 'application/json'
    },
    // sending data
    body: JSON.stringify({
      order: {
        name: nameEl.value,
        email: emailEl.value,
        // not a token but a payment method now!
        stripe_payment_method: paymentMethod.id
        // IF you wanna put their own stripe secret key in,
        // USUALLY DONT DO THIS, comment next line if you wanna test
        // stripe_secret_key: "sk_test_asdf"
        // BUT DONT PUT YOUR SECRET KEY IN JS ANYWHERE
        // BECAUSE PEOPLE WILL STEAL YO MONEY!
      }
    })
  })
  	// with fetch we get back a response which we turn into json
    .then(response => response.json())
  	// we get it back as data which we can do stuff with
    .then(data => {
      form.classList.remove('processing')
      // back from the back-end, not Stripe!
      if (data.order) {
        // all went through fine
        console.log('all good, first time!')
        showSuccess()
      } else if (data.errors.base == 'requires_action') {
        // the API will return back something from Stripe
        // if it's needed to confirm the payment with 3D secure
        // or any other verficiation check
        stripe.handleCardPayment(data.errors.payment_intent_client_secret).then(result => {
          if (result.error) {
            // failed, said no user declined check
            console.error('failed check')
            showErrors('Please try again and confirm your payment')
          } else {
            console.log('verified check')
            // confirmed, user verified
            showSuccess()
          }
        })
      } else {
        // show stripe payment errors from the API (e.g. "not enough funds")
        console.error('stripe error', data)
        showErrors(data.errors.stripe_payment_method)
      }
    })
  	// if there's an error, we can do something 
    .catch(error => {
      form.classList.remove('processing')
      // general message, e.g. Stripe is down
      console.error('general error', error)
      showErrors(
        `There was an error with payment, please try again or contact us at help@goodtim.es`
      )
    })
}

// grab all the anchor tags on the page
const anchors = document.querySelectorAll('a')
// loop over them
anchors.forEach(anchor => {
  // listen for clicks on each one
  anchor.addEventListener('click', event => {
    // grab the href attribute
    const href = anchor.getAttribute('href')
    // if the href starts with a #
    if (href.charAt(0) === '#') {
      // stop the default action
      event.preventDefault()
      // find the element the href points to and scroll it into view
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      })
    }
  })
})








