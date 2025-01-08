import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url =
    process.env.VERCEL_ENV === 'development'
        ? process.env.DATABASE_URL!
        : process.env.TURSO_DATABASE_URL!

const authToken =
    process.env.VERCEL_ENV === 'development'
        ? undefined!
        : process.env.TURSO_AUTH_TOKEN!

export default defineConfig({
    schema: './src/db/drizzle/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    driver: 'turso',
    dbCredentials: {
        url: url,
        authToken: authToken,
    },
})
