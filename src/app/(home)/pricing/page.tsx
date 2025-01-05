'use client'

import { TopNavbar } from '@/components/top-navbar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { PLANS } from '@/config/plans'
import { PricingCard } from '@/components/pricing/pricing-card'
import React from 'react'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export default function PricingSectionCards() {
    const { data: session } = useSession()
    const [isYearly, setIsYearly] = useState(false)
    const { toast } = useToast()

    const [prices, setPrices] = React.useState<Stripe.Price[]>()

    React.useEffect(() => {
        const getPrices = async () => {
            const prices = await stripe.prices.list({
                lookup_keys: [
                    'plus_monthly, plus_yearly, pro_monthly, pro_yearly',
                ],
            })
            setPrices(prices.data)
        }

        getPrices()
    }, [])

    const handleSubscribe = async (priceId: string) => {
        try {
            if (!session?.user) {
                toast({
                    title: 'Error',
                    description: 'Please sign in to subscribe',
                    variant: 'destructive',
                })
                return
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    isYearly,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error('Failed to create checkout session')
            }

            window.location.href = data.url
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <>
            <TopNavbar />
            <div className="container py-24 lg:py-32">
                <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
                    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                        Pricing
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                        Choose the plan that works best for you
                    </p>
                </div>

                <div className="flex justify-center items-center mb-8">
                    <Label htmlFor="billing-period" className="me-3">
                        Monthly
                    </Label>
                    <Switch
                        id="billing-period"
                        checked={isYearly}
                        onCheckedChange={setIsYearly}
                    />
                    <Label htmlFor="billing-period" className="relative ms-3">
                        Annual
                        <span className="absolute -top-10 start-auto -end-28">
                            <Badge className="mt-3 uppercase">
                                Save up to 20%
                            </Badge>
                        </span>
                    </Label>
                </div>

                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {Object.values(PLANS).map((plan) => (
                        <PricingCard
                            key={plan.name}
                            plan={plan}
                            isYearly={isYearly}
                            onSubscribe={handleSubscribe}
                            isSignedIn={!!session?.user}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
