import { betterAuth } from 'better-auth'
import { LibsqlDialect } from '@libsql/kysely-libsql'

const dialect = new LibsqlDialect({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
})

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
            accessTokenExpiresAt: 'access_token_expires',
            idToken: 'id_token',
        },
    },
    database: {
        dialect,
        type: 'sqlite',
    },
})
