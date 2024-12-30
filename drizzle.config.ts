import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
    schema: './src/db/drizzle/schema.ts',
    out: './drizzle',
    dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
    driver: 'turso',
    dbCredentials: {
        url: process.env.NODE_ENV === 'development' ? process.env.DATABASE_URL! : process.env.TURSO_DATABASE_URL!,
        authToken: process.env.NODE_ENV === 'development' ? process.env.DATABASE_AUTH_TOKEN! : process.env.TURSO_AUTH_TOKEN,
    },
})
