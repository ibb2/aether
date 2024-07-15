import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const users = sqliteTable("users", {
  id: text("id").$defaultFn(() => createId()),
  firstName: text("text"),
  lastName: text("text"),
  createdAt: text("timestamp").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("timestamp").default(sql`(CURRENT_TIMESTAMP)`),
});
