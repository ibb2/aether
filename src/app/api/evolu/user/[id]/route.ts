import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { users } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id))

        if (!existingUser.length) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(existingUser[0])
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred',
            },
            { status: 500 }
        )
    }
}
