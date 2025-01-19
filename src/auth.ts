import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import {
    users,
    accounts,
    sessions,
    verificationTokens,
} from './db/drizzle/schema'
import type { Provider } from 'next-auth/providers'
import { db } from './db/drizzle'
import { evolu } from './db/db'
import { eq } from 'drizzle-orm'

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
    },
    callbacks: {
        authorized: async ({ request, auth }) => {
            const url = request.nextUrl
            if (url.pathname === '/app') {
                // If the user is authenticated, allow access
                return !!auth?.user
            }
            // For other paths, allow access by default (if desired)
            return true
        },
        session({ session, user }) {
            session.user.id = user.id
            return session
        },
    },
})
