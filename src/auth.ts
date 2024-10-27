import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db/drizzle/index'
import {
    users,
    accounts,
    sessions,
    verificationTokens,
} from './db/drizzle/schema'
import type { Provider } from 'next-auth/providers'

const providers: Provider[] = [GitHub, Resend, Google]

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === 'function') {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })
    .filter((provider) => provider.id !== 'credentials')

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true,
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    providers: [
        GitHub,
        Google,
        Resend({
            from: 'noreply@aethernotes.ink',
        }),
    ],
    pages: {
        signIn: '/login',
        verifyRequest: '/auth/verify-request', // Used to display message to user after email is sent
    },
})
