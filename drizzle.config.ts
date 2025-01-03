import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
        ? process.env.DATABASE_URL!
        : process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!

const authToken =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
        ? undefined!
        : process.env.TURSO_AUTH_TOKEN!

console.log('Development?', process.env.NEXT_PUBLIC_VERCEL_ENV)
console.log('another url', url)

export default defineConfig({
    schema: './src/db/drizzle/schema.ts',
    out: './drizzle',
    dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
    driver: 'turso',
    dbCredentials: {
        url: url,
        authToken: authToken,
    },
})
