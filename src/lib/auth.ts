import { db } from '@/db/drizzle'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '@/db/drizzle/schema'
import { LibsqlDialect } from '@libsql/kysely-libsql'

// const dialect = new LibsqlDialect({
//     url: process.env.DATABASE_URL as string,
//     // authToken: '' as string,
// })

export const auth = betterAuth({
    //...
    session: {
        fields: {
            expiresAt: 'expires', // Map your existing `expires` field to Better Auth's `expiresAt`
            token: 'sessionToken', // Map your existing `sessionToken` field to Better Auth's `token`
        },
    },
    account: {
        fields: {
            accountId: 'providerAccountId',
            refreshToken: 'refresh_token',
            accessToken: 'access_token',
            accessTokenExpiresAt: 'expires_at',
            idToken: 'id_token',
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        },
        github: {
            clientId: process.env.AUTH_GITHUB_ID as string,
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
        },
    },
    // database: {
    //     dialect,
    //     type: 'sqlite',
    // },
    database: drizzleAdapter(db, {
        provider: 'sqlite', // or "mysql", "sqlite",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verification,
            verificationToken: schema.verificationTokens,
        },
    }),
})
