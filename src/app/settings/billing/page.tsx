import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { subscriptions } from '@/db/drizzle/schema'
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

const APP_URL = process.env.VERCEL_URL
    ? process.env.VERCEL_URL
    : 'http://localhost:3000'

export default async function BillingPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, session.user.id!))

    let currentPlan: Plan = PLANS.BASIC
    let portalUrl = null

    if (subscription) {
        // Find the plan based on the subscription interval
        const isYearly = subscription.interval === 'year'

        if (isYearly) {
            if (subscription.priceId.includes('plus')) {
                currentPlan = PLANS.PLUS_YEARLY as Plan
            } else if (subscription.priceId.includes('pro')) {
                currentPlan = PLANS.PROFFESSIONAL_YEARLY as Plan
            }
        } else {
            if (subscription.priceId.includes('plus')) {
                currentPlan = PLANS.PLUS as Plan
            } else if (subscription.priceId.includes('pro')) {
                currentPlan = PLANS.PROFFESSIONAL as Plan
            }
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
    const isYearlyPlan = 'yearly' in currentPlan && currentPlan.yearly

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
                                {isYearlyPlan ? ' (Yearly)' : ''}
                            </p>
                            {subscription && (
                                <p className="text-sm text-muted-foreground">
                                    Billing period:{' '}
                                    {subscription.interval === 'year'
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
