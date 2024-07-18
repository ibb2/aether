"use server";

import { lucia } from "@/lib/auth";
import { Session } from "lucia";

export async function logout(session: Session) {
  await lucia.invalidateSession(session.id);
}
