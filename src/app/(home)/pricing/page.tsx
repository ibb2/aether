'use client';

import { TopNavbar } from '@/components/top-navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CheckIcon } from 'lucide-react'
import { useSession } from "next-auth/react"
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { PLANS } from '@/config/plans'

export default function PricingSectionCards() {
    const { data: session } = useSession()
    const [isYearly, setIsYearly] = useState(false);
    const { toast } = useToast()

    const handleSubscribe = async (priceId: string) => {
        try {
            if (!session?.user) {
                toast({
                    title: "Error",
                    description: "Please sign in to subscribe",
                    variant: "destructive",
                })
                return;
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    isYearly
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            window.location.href = data.url;
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        }
    };

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
                            <Badge className="mt-3 uppercase">Save up to 10%</Badge>
                        </span>
                    </Label>
                </div>

                <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Free Plan */}
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-7">{PLANS.FREE.name}</CardTitle>
                            <span className="font-bold text-5xl">Free</span>
                        </CardHeader>
                        <CardDescription className="text-center">Forever free</CardDescription>
                        <CardContent>
                            <ul className="mt-7 space-y-2.5 text-sm">
                                {PLANS.FREE.features.map((feature, index) => (
                                    <li key={index} className="flex space-x-2">
                                        <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant={'outline'}>
                                Get Started
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Basic Plan */}
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-7">{PLANS.BASIC.name}</CardTitle>
                            <span className="font-bold text-5xl">
                                ${isYearly ? PLANS.BASIC.price.yearly.amount : PLANS.BASIC.price.monthly.amount}
                            </span>
                            <span className="text-sm font-normal text-muted-foreground">
                                /{isYearly ? 'year' : 'month'}
                            </span>
                        </CardHeader>
                        <CardDescription className="text-center">Best for professionals</CardDescription>
                        <CardContent>
                            <ul className="mt-7 space-y-2.5 text-sm">
                                {PLANS.BASIC.features.map((feature, index) => (
                                    <li key={index} className="flex space-x-2">
                                        <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => handleSubscribe(
                                    isYearly
                                        ? PLANS.BASIC.price.yearly.priceId
                                        : PLANS.BASIC.price.monthly.priceId
                                )}
                            >
                                {!session?.user ? 'Sign in to upgrade' : 'Upgrade to Basic'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}
