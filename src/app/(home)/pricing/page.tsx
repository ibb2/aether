'use client'

import * as S from '@effect/schema/Schema'

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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { evolu } from '@/db/db'
import { loadStripe } from '@stripe/stripe-js'
import { CheckIcon, MinusIcon } from 'lucide-react'
import React from 'react'

interface PlanFeature {
    type: string
    features: {
        name: string
        free: boolean
        startup: boolean
        team: boolean
        enterprise: boolean
    }[]
    type: string
    features: {
        name: string
        free: boolean
        startup: boolean
        team: boolean
        enterprise: boolean
    }[]
}

const planFeatures: PlanFeature[] = [
    {
        type: 'Financial data',
        features: [
            {
                name: 'Open/High/Low/Close',
                free: true,
                startup: true,
                team: true,
                enterprise: true,
            },
            {
                name: 'Price-volume difference indicator	',
                free: true,
                startup: true,
                team: true,
                enterprise: true,
            },
        ],
    },
    {
        type: 'On-chain data',
        features: [
            {
                name: 'Network growth',
                free: true,
                startup: false,
                team: true,
                enterprise: true,
            },
            {
                name: 'Average token age consumed',
                free: true,
                startup: false,
                team: true,
                enterprise: true,
            },
            {
                name: 'Exchange flow',
                free: false,
                startup: false,
                team: true,
                enterprise: true,
            },
            {
                name: 'Total ERC20 exchange funds flow',
                free: false,
                startup: false,
                team: true,
                enterprise: true,
            },
        ],
    },
    {
        type: 'Social data',
        features: [
            {
                name: 'Dev activity',
                free: false,
                startup: true,
                team: false,
                enterprise: true,
            },
            {
                name: 'Topic search',
                free: true,
                startup: true,
                team: true,
                enterprise: true,
            },
            {
                name: 'Relative social dominance',
                free: true,
                startup: true,
                team: false,
                enterprise: true,
            },
        ],
    },
]

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// If using TypeScript, add the following snippet to your file as well.
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-pricing-table': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >
        }
    }
}

export default function PricingSectionCards() {
    const [monthly, onMonthly] = React.useState(true)

    console.log(evolu.getOwner()?.id)

    return (
        <>
            {/* Pricing */}
            <TopNavbar />
            <div className="container py-24 lg:py-32">
                <stripe-pricing-table
                    pricing-table-id="prctbl_1QCy7ZJBPSgR8cUz1Czs38nu"
                    publishable-key={
                        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
                    }
                    client-reference-id={evolu.getOwner()?.id.toString()}
                    // success-url="http://localhost:3000/checkout/success"
                ></stripe-pricing-table>
            </div>
            {/* End Pricing */}
        </>
    )
}
