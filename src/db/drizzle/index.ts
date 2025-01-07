/*
  This is client code for future reference  e.g.
*/
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

const url =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
        ? process.env.DATABASE_URL!
        : process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!

const authToken =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
        ? undefined
        : process.env.TURSO_AUTH_TOKEN

const client = createClient({
    url: url,
    authToken: authToken,
})

export const db = drizzle(client)
