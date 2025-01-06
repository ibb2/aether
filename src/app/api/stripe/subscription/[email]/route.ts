import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/db/drizzle'
import { users, subscriptions } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: { email: string } }
) {
    try {
        const { email } = params
        console.log('email', email)

        // Get user and their subscription
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))

        if (!existingUser.length || !existingUser[0].stripeCustomerId) {
            return NextResponse.json({ plan: 'basic', status: 'inactive' })
        }

        // Get subscription details from database
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, existingUser[0].id))

        if (!subscription) {
            return NextResponse.json({ plan: 'basic', status: 'inactive' })
        }

        // Get customer details from Stripe
        const customerResponse = await stripe.customers.retrieve(
            existingUser[0].stripeCustomerId,
            {
                expand: ['subscriptions'],
            }
        )

        const customer = customerResponse as any

        const stripeSubscription = customer.subscriptions?.data[0]
        const planName =
            stripeSubscription?.items.data[0]?.price.nickname?.toLowerCase() ||
            ''

        let plan = 'basic'
        if (planName.includes('pro')) {
            plan = 'pro'
        } else if (planName.includes('plus')) {
            plan = 'plus'
        }

        console.log('plan', plan)
        return NextResponse.json({
            plan,
            status: subscription.status,
            priceId: subscription.priceId,
        })
    } catch (error) {
        console.error('Subscription check error:', error)
        return NextResponse.json(
            { error: 'Failed to check subscription' },
            { status: 500 }
        )
    }
}
