import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

console.log('process.env.DATABASE_URL', process.env.DATABASE_URL!)

const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
})
export const db = drizzle(client)
