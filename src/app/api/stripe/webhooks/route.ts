import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { eq } from 'drizzle-orm'
import { db } from '@/db/drizzle'
import { subscriptions, users } from '@/db/drizzle/schema'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.VERCEL_ENV !== 'production'
                ? process.env.STRIPE_TEST_WEBHOOK_SECRET!
                : process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, {
            status: 400,
        })
    }

    const session = event.data.object

    switch (event.type) {
        case 'checkout.session.completed': {
            const checkoutSession = session as Stripe.Checkout.Session

            const userId = checkoutSession.metadata?.userId
            if (userId == null) {
                throw new Error('No userId found in checkout session metadata')
            }

            const subscription = await stripe.subscriptions.retrieve(
                checkoutSession.subscription as string
            )

            await db.insert(subscriptions).values({
                userId: userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                status: subscription.status as string,
                priceId: subscription.items.data[0].price.id,
                interval: (subscription.items.data[0].price.recurring
                    ?.interval || 'month') as string,
                currentPeriodStart: new Date(
                    subscription.current_period_start * 1000
                ),
                currentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
                createdAt: new Date(),
                updatedAt: new Date(),
            })

            break
        }

        case 'customer.subscription.updated': {
            const subscription = session as Stripe.Subscription
            await db
                .update(subscriptions)
                .set({
                    status: subscription.status,
                    priceId: subscription.items.data[0].price.id,
                    interval:
                        subscription.items.data[0].price.recurring?.interval ||
                        'month',
                    currentPeriodStart: new Date(
                        subscription.current_period_start * 1000
                    ),
                    currentPeriodEnd: new Date(
                        subscription.current_period_end * 1000
                    ),
                    updatedAt: new Date(),
                })
                .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
            break
        }

        case 'customer.subscription.deleted': {
            const subscription = session as Stripe.Subscription
            await db
                .delete(subscriptions)
                .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
            break
        }
    }

    return new NextResponse(null, { status: 200 })
}
