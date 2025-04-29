/*
  This is client code for future reference  e.g.
*/
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import * as schema from './schema'

const authToken =
    process.env.VERCEL_ENV === 'development'
        ? undefined
        : process.env.TURSO_AUTH_TOKEN

console.log(`${process.env.DATABASE_URL}`)

const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: authToken,
})

export const db = drizzle(client, {
    schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verification,
        verificationToken: schema.verificationTokens,
        authenticator: schema.authenticators,
        subscription: schema.subscriptions,
    },
    logger: true,
})
