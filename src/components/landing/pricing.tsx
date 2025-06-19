'use client'

import { TopNavbar } from '@/components/top-navbar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { PLANS, type Plan } from '@/config/plans'
import { PricingCard } from '@/components/pricing/pricing-card'
import { PricingSkeleton } from '@/components/pricing/pricing-skeleton'
import type Stripe from 'stripe'
import { useSession } from '@/lib/auth-client'

export default function PricingSection() {
    const { data: session } = useSession()
    const [isYearly, setIsYearly] = useState(false)
    const { toast } = useToast()
    const [prices, setPrices] = useState<Stripe.Price[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch('/api/stripe/prices')
                if (!response.ok) {
                    throw new Error('Failed to fetch prices')
                }
                const data = await response.json()
                setPrices(data)
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load pricing information',
                    variant: 'destructive',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchPrices()
    }, [toast])

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
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            })
        }
    }

    // Filter plans based on billing period
    const filteredPlans = Object.values(PLANS).filter((plan: Plan) => {
        if ('price' in plan) return true // Always show free plan
        return plan.yearly === isYearly // Show only yearly or monthly plans based on selection
    })

    return (
        <div className="mb-28">
            <main>
                <section className="py-16 md:py-24" id="pricing">
                    <div className="container max-w-6xl py-8">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Flexible plans for everyone
                            </h2>
                            <p className="text-lg text-gray-400 max-w-xl mx-auto">
                                Choose the plan that’s right for you. No hidden
                                fees, cancel anytime.
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
                            <Label
                                htmlFor="billing-period"
                                className="relative ms-3"
                            >
                                Annual
                                <span className="absolute -top-10 start-auto -end-28">
                                    <Badge className="mt-3 uppercase">
                                        Save up to 20%
                                    </Badge>
                                </span>
                            </Label>
                        </div>

                        {loading ? (
                            <PricingSkeleton />
                        ) : (
                            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                {filteredPlans.map((plan) => {
                                    const price = prices.find(
                                        (price) =>
                                            price.lookup_key === plan.lookupKey
                                    )

                                    return (
                                        <PricingCard
                                            key={plan.name}
                                            plan={plan}
                                            price={price}
                                            isYearly={isYearly}
                                            onSubscribe={handleSubscribe}
                                            isSignedIn={!!session?.user}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}
