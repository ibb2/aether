// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!)

const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
        {
            price: '{{PRICE_ID}}',
            quantity: 1,
        },
    ],
    ui_mode: 'embedded',
    return_url:
        'http://localhost:3000/checkout/return?session_id={CHECKOUT_SESSION_ID}',
})
