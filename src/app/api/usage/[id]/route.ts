import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@tursodatabase/api'
import { db } from '@/db/drizzle'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const sanitizedUserId = id.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        const dbName = 'evolu-' + sanitizedUserId
        const orgSlug = 'ibb2'

        console.log('id', id)
        console.log('sanitizedUserId', sanitizedUserId)
        console.log('dbName', dbName)
        console.log('orgSlug', orgSlug)

        try {
            const turso = createClient({
                org: '',
                token: process.env.TURSO_API_TOKEN!,
            })

            const database = await turso.databases.get(dbName)
            const usage = await turso.databases.usage(dbName)

            return NextResponse.json(usage)
        } catch (error) {
            throw new Error(`Database check failed: ${error.message}`)
        }
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
