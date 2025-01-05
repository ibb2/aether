import Stripe from 'stripe'

// This ensures these Stripe functions can only be used on the server side
if (typeof window !== 'undefined') {
    throw new Error('Stripe can only be accessed server-side.')
}

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
    typescript: true,
})

export const getStripePrices = async () => {
    // First, let's get all active prices
    const prices = await stripe.prices.list({
        active: true,
        expand: ['data.product'],
    })

    return prices.data
}
