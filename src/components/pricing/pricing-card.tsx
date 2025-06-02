'use client'

import { CheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { type Plan } from '@/config/plans'
import type Stripe from 'stripe'

interface PricingCardProps {
    plan: Plan
    price?: Stripe.Price
    isYearly: boolean
    onSubscribe: (priceId: string) => void
    isSignedIn: boolean
}

export function PricingCard({
    plan,
    price,
    isYearly,
    onSubscribe,
    isSignedIn,
}: PricingCardProps) {
    if (
        price &&
        ((price.recurring?.interval === 'year' && !isYearly) ||
            (price.recurring?.interval === 'month' && isYearly))
    ) {
        return null
    }

    const isPaidPlan = 'yearly' in plan

    const getPlanDescription = (planName: string) => {
        switch (planName.toLowerCase()) {
            case 'basic':
                return 'Perfect for getting started'
            case 'plus':
                return 'Best for regular users'
            case 'pro':
                return 'Best for professionals'
            default:
                return 'Forever free'
        }
    }

    return (
        <Card className="flex flex-col h-full transform hover:scale-[1.03]">
            <CardHeader className="text-center pb-2">
                <CardTitle className="mb-7">{plan.name}</CardTitle>
                <div className="space-y-1">
                    <span className="font-bold text-4xl">
                        {isPaidPlan && price
                            ? `$${(price.unit_amount || 0) / 100} ${price.currency.toUpperCase()}`
                            : 'Free'}
                    </span>
                    {isPaidPlan && price && (
                        <div>
                            <span className="text-sm font-normal text-muted-foreground">
                                /{price.recurring?.interval}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardDescription className="text-center">
                {getPlanDescription(plan.name)}
            </CardDescription>
            <CardContent className="flex-grow">
                <ul className="mt-7 space-y-2.5 text-sm">
                    {plan.features.map((feature: string, index: number) => (
                        <li key={index} className="flex space-x-2">
                            <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                            <span className="text-muted-foreground">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
                {isPaidPlan && price ? (
                    <Button
                        className="w-full"
                        onClick={() => onSubscribe(price.id)}
                    >
                        {!isSignedIn
                            ? 'Sign in to upgrade'
                            : `Upgrade to ${plan.name}`}
                    </Button>
                ) : (
                    <Button className="w-full" variant="outline">
                        Get Started
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
