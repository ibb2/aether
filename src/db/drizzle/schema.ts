import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('user', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    evoluOwnerId: text('evolu_user_id'),
    name: text('name'),
    email: text('email').unique(),
    emailVerified: integer('emailVerified', { mode: 'boolean' }),
    image: text('image'),
    stripeCustomerId: text('stripeCustomerId'),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

export const accounts = sqliteTable(
    'account',
    {
        id: text('id'),
        userId: text('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        providerId: text('provider_id'),
        providerAccountId: text('providerAccountId').notNull(),
        evoluOwnerId: text('evolu_owner_id'),
        refresh_token: text('refresh_token'),
        refreshTokenExpiresAt: integer('refresh_token_expires_at', {
            mode: 'timestamp',
        }),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        scope: text('scope'),
        password: text('password'),
        id_token: text('id_token'),
        createdAt: integer('created_at', { mode: 'timestamp' }),
        updatedAt: integer('updatedAt', { mode: 'timestamp' }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.providerId, account.providerAccountId],
        }),
    })
)

export const sessions = sqliteTable('session', {
    id: text('id'),
    sessionToken: text('sessionToken').primaryKey(),
    token: text('token').unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }),
})

export const verification = sqliteTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

export const verificationTokens = sqliteTable(
    'verificationToken',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: integer('expires', { mode: 'timestamp' }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
)

export const authenticators = sqliteTable(
    'authenticator',
    {
        credentialID: text('credentialID').notNull().unique(),
        userId: text('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        providerAccountId: text('providerAccountId').notNull(),
        credentialPublicKey: text('credentialPublicKey').notNull(),
        counter: integer('counter').notNull(),
        credentialDeviceType: text('credentialDeviceType').notNull(),
        credentialBackedUp: integer('credentialBackedUp', {
            mode: 'boolean',
        }).notNull(),
        transports: text('transports'),
    },
    (authenticator) => ({
        compositePK: primaryKey({
            columns: [authenticator.userId, authenticator.credentialID],
        }),
    })
)

export const subscriptions = sqliteTable('subscription', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    priceId: text('priceId').notNull(),
    interval: text('interval').notNull(),
    stripeCustomerId: text('stripeCustomerId').notNull(),
    stripeSubscriptionId: text('stripeSubscriptionId').notNull(),
    currentPeriodStart: integer('currentPeriodStart', {
        mode: 'timestamp',
    }).notNull(),
    currentPeriodEnd: integer('currentPeriodEnd', {
        mode: 'timestamp',
    }).notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(
        () => new Date()
    ), // Use `new Date()`
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(
        () => new Date()
    ), // Use `new Date()`
})
