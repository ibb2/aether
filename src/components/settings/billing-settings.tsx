'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { PLANS } from '@/config/plans'

interface BillingSettingsProps {
  className?: string
}

interface Subscription {
  id: string
  status: string
  priceId: string
  interval: 'month' | 'year'
  currentPeriodEnd: number
  stripeCustomerId: string
  stripeSubscriptionId: string
}

export function BillingSettings({ className }: BillingSettingsProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/subscription')
        const data = await res.json()
        setSubscription(data)

        if (data?.stripeCustomerId) {
          const portalRes = await fetch('/api/stripe/portal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: data.stripeCustomerId,
            }),
          })
          const portalData = await portalRes.json()
          setPortalUrl(portalData.url)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const currentPlan = subscription
    ? Object.values(PLANS).find(
      plan =>
        (plan.price !== 0 && plan.lookupKey === (subscription.interval === 'month' ? 'plus_monthly' : 'plus_yearly'))
    ) || PLANS.BASIC
    : PLANS.BASIC

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentPlan.name}
                  {subscription?.status && (
                    <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'} className="ml-2">
                      {subscription.status}
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentPlan === PLANS.BASIC
                    ? 'Free tier with basic features'
                    : `${subscription?.interval === 'year' ? 'Yearly' : 'Monthly'} subscription`}
                </p>
              </div>
              {subscription?.status === 'active' && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {currentPlan !== PLANS.BASIC && (
              <div className="rounded-lg border p-4">
                <div className="space-y-3">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            {subscription ? (
              <>
                {portalUrl && (
                  <Button asChild>
                    <a href={portalUrl} className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </a>
                  </Button>
                )}
              </>
            ) : (
              <Button asChild>
                <a href="/pricing" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View your recent payments and download invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              portalUrl ? (
                <Button variant="outline" asChild>
                  <a href={portalUrl} className="flex items-center">
                    View Payment History
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Loading payment history...</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">No payment history available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
