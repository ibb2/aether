import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/drizzle/schema",
  out: "./drizzle",
  dialect: "sqlite", // 'postgresql' | 'mysql' | 'sqlite'
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
