import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

const APP_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { customerId } = await req.json()

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${APP_URL}/settings`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
