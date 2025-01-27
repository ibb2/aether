import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request) {
    const { sessionId } = await request.json()

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status === 'paid') {
            // Update your database to mark the user as subscribed
            // await updateUserSubscriptionStatus(session.client_reference_id, 'active');
        }

        return NextResponse.json({ session })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
