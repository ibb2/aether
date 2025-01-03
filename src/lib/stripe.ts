import Stripe from 'stripe'

if (!process.env.STRIPE_TEST_SECRET_KEY || !process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(
    process.env.VERCEL_ENV === 'production'
        ? process.env.STRIPE_TEST_SECRET_KEY
        : process.env.STRIPE_SECRET_KEY,
    {
        apiVersion: '2024-09-30.acacia',
        typescript: true,
    }
)
