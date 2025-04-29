import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const authToken =
    process.env.VERCEL_ENV === 'development'
        ? undefined!
        : process.env.TURSO_AUTH_TOKEN!

export default defineConfig({
    schema: './src/db/drizzle/schema.ts',
    out: './drizzle',
    dialect: 'turso',
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
        authToken: process.env.TURSO_AUTH_TOKEN as string,
    },
})
