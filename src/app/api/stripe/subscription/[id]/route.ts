import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/db/drizzle'
import { users } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id))

        if (!existingUser.length || !existingUser[0].stripeCustomerId) {
            return NextResponse.json({ plan: 'basic' })
        }

        const customerResponse = await stripe.customers.retrieve(
            existingUser[0].stripeCustomerId
        )
        const customer = customerResponse as any

        const subscription = customer.subscriptions?.data[0]
        const planName =
            subscription?.items.data[0]?.price.nickname?.toLowerCase() || ''

        let plan = 'basic'
        if (planName.includes('pro')) {
            plan = 'pro'
        } else if (planName.includes('plus')) {
            plan = 'plus'
        }

        return NextResponse.json({ plan })
    } catch (error) {
        console.error('Subscription check error:', error)
        return NextResponse.json(
            { error: 'Failed to check subscription' },
            { status: 500 }
        )
    }
}
