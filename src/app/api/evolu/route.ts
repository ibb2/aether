// app/api/save-evolu-id/route.js
import { db } from '@/db/drizzle'
import { users } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { email, evoluOwnerId } = await request.json()

        // First, check if `evoluOwnerId` is already set for this user
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))

        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // If `evoluOwnerId` is already set, do not update it
        if (existingUser[0].evoluOwnerId) {
            return NextResponse.json({
                success: false,
                message:
                    'evoluOwnerId has already been set and cannot be updated again',
            })
        }

        await db
            .update(users)
            .set({ evoluOwnerId })
            .where(eq(users.email, email))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving Evolu ID to Turso:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
