import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { subscriptions } from '@/db/drizzle/schema';
import { stripe } from '@/lib/stripe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/config/plans';
import Link from 'next/link';

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, session.user.id));

  let currentPlan = PLANS.FREE;
  let portalUrl = null;

  if (subscription) {
    // Find the plan based on the priceId
    const isYearly = subscription.interval === 'year';

    if (subscription.priceId === PLANS.BASIC.price.yearly.priceId ||
      subscription.priceId === PLANS.BASIC.price.monthly.priceId) {
      currentPlan = PLANS.BASIC;
    }

    // Create Stripe portal session
    if (subscription.stripeSubscriptionId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      });
      portalUrl = portalSession.url;
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Billing Settings</CardTitle>
          <CardDescription>Manage your subscription and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Current Plan</h3>
              <p className="text-sm text-muted-foreground">{currentPlan.name}</p>
              {subscription && (
                <p className="text-sm text-muted-foreground">
                  Billing period: {subscription.interval === 'year' ? 'Yearly' : 'Monthly'}
                </p>
              )}
            </div>
            {portalUrl ? (
              <Button asChild>
                <a href={portalUrl}>Manage Subscription</a>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/pricing">Upgrade to Basic</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
