import { createClient as createTursoClient } from '@tursodatabase/api'
import { auth } from '@clerk/nextjs/server'
import md5 from 'md5'

export const turso = createTursoClient({
    token: process.env.TURSO_USER_API_TOKEN!,
    org: process.env.TURSO_ORG_NAME!,
})

export function getDatabaseName() {
    const userId = auth().userId
    if (!userId) return null
    return md5(userId)
}

export async function checkDatabaseExists() {
    const dbName = getDatabaseName()
    if (!dbName) return false

    try {
        await turso.databases.get(dbName)
        return true
    } catch {
        return false
    }
}
