import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { subscriptions, users } from '@/db/drizzle/schema'
import { stripe } from '@/lib/stripe'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PLANS, type Plan } from '@/config/plans'
import Link from 'next/link'
import { string } from 'zod'

const APP_URL = process.env.VERCEL_URL
    ? process.env.VERCEL_URL
    : 'http://localhost:3000'

export default async function BillingPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email!))

    const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, session.user.id!))

    let currentPlan: Plan = PLANS.BASIC
    let portalUrl = null

    const customerResponse = await stripe.customers.retrieve(
        existingUser[0].stripeCustomerId!,
        {
            expand: ['subscriptions'],
        }
    )

    const customer = customerResponse as any

    const stripeSubscription = customer.subscriptions?.data[0]
    const plan =
        stripeSubscription?.items.data[0]?.price.nickname?.toLowerCase() || ''

    if (subscription) {
        // Find the plan based on the subscription interval
        const planCleaned = plan.replace(' ', '_')
        switch (planCleaned) {
            case 'plus_monthly':
                currentPlan = PLANS.PLUS
                break
            case 'plus_yearly':
                currentPlan = PLANS.PLUS_YEARLY
                break
            case 'pro_monthly':
                currentPlan = PLANS.PROFFESSIONAL
                break
            case 'pro_yearly':
                currentPlan = PLANS.PROFFESSIONAL_YEARLY
                break
            default:
                currentPlan = PLANS.BASIC
        }

        // Create Stripe portal session
        if (subscription.stripeSubscriptionId) {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: subscription.stripeCustomerId,
                return_url: `${APP_URL}/settings/billing`,
            })
            portalUrl = portalSession.url
        }
    }

    const planName = currentPlan.name

    return (
        <div className="container max-w-4xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Billing Settings</CardTitle>
                    <CardDescription>
                        Manage your subscription and billing information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">
                                Current Plan
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {planName}
                            </p>
                            {subscription && (
                                <p className="text-sm text-muted-foreground">
                                    Billing period:{' '}
                                    {currentPlan.name.includes('yearly')
                                        ? 'Yearly'
                                        : 'Monthly'}
                                </p>
                            )}
                        </div>
                        {portalUrl ? (
                            <Button asChild>
                                <a href={portalUrl}>Manage Subscription</a>
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href="/pricing">Upgrade Plan</Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
