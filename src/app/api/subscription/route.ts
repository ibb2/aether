import { auth } from '@/auth'
import { db } from '@/db/drizzle'
import { subscriptions } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, session.user.id!))

        return NextResponse.json(subscription || null)
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
