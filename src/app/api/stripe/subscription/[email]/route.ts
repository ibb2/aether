import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/db/drizzle'
import { users, subscriptions } from '@/db/drizzle/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: { email: string } }
) {
    try {
        const { email } = params

        // Perform case-insensitive and trimmed email search
        const userQueryResult = await db
            .select()
            .from(users)
            .where(sql`lower(trim(email)) = lower(trim(${email}))`)

        // If no user found
        if (userQueryResult.length === 0) {
            return NextResponse.json({ 
                plan: 'basic', 
                status: 'inactive',
                error: 'No user found'
            })
        }

        const existingUser = userQueryResult[0]

        if (!existingUser.stripeCustomerId) {
            return NextResponse.json({ 
                plan: 'basic', 
                status: 'inactive',
                error: 'No Stripe customer ID'
            })
        }

        // Get subscription details from database
        const subscriptionQueryResult = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, existingUser.id))

        // If no subscription found
        if (!subscriptionQueryResult.length) {
            return NextResponse.json({ 
                plan: 'basic', 
                status: 'inactive',
                error: 'No subscription found'
            })
        }

        const [subscription] = subscriptionQueryResult

        // Get customer details from Stripe
        const customerResponse = await stripe.customers.retrieve(
            existingUser.stripeCustomerId,
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
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
