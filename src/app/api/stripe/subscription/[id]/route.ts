import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/db/drizzle'
import { users, subscriptions } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Get user and their subscription
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id))

        if (!existingUser.length || !existingUser[0].stripeCustomerId) {
            return NextResponse.json({ plan: 'basic', status: 'inactive' })
        }

        // Get subscription details from database
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, id))

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
        const planCleaned = planName.replace(' ', '_')

        let plan = 'basic'
        if (planCleaned.includes('pro_')) {
            plan = 'pro'
        } else if (planCleaned.includes('plus_')) {
            plan = 'plus'
        }

        return NextResponse.json({
            plan,
            status: subscription.status,
            priceId: subscription.priceId,
        })
    } catch (error) {
        console.error('Subscription check error:', error)
        return NextResponse.json(
            {
                error: 'Failed to check subscription',
                plan: 'basic',
                status: 'inactive',
            },
            { status: 500 }
        )
    }
}
