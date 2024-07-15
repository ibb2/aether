import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { db } from "@/db/drizzle";
import { sessions } from "@/db/drizzle/schema/sessions";
import { users } from "@/db/drizzle/schema/users";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export default adapter;
