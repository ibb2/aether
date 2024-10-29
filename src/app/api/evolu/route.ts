// app/api/save-evolu-id/route.js
import { db } from '@/db/drizzle'
import { users } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(request) {
    console.log('Post request')
    const { email, evoluOwnerId } = await request.json()

    try {
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
