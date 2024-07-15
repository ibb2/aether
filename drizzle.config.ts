import { defineConfig } from "drizzle-kit";

export default {
  schema: "./src/db/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", // 'postgresql' | 'mysql' | 'sqlite'
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
