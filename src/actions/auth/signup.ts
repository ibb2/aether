"use server";

import * as S from "@effect/schema/Schema";
import { db } from "@/db/drizzle";
import { users } from "@/db/drizzle/schema/users";
import { lucia } from "@/lib/auth";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { eq, lt, gte, ne } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { formSchema } from "@/app/app/(auth)/signup/page";
import { Schema } from "zod";

export type FormState = {
  // message?: string;
  error?: string;
};

export async function signup(prevState: FormState, data: FormData) {
  // export async function signup(formData: FormData): Promise<ActionResult> {
  // "use server";

  const formData = Object.fromEntries(data);

  // Username validation
  const username = formData.username;
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: "Invalid username",
    };
  }

  // Email validation
  const email = formData.email;
  if (
    !/^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i.test(
      email,
    )
  ) {
    return { error: "Invalid email" };
  }

  // Password Validation
  const password = formData.password;
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const confirmPassword = formData.confirmPassword;
  if (
    typeof confirmPassword !== "string" ||
    confirmPassword.length < 6 ||
    confirmPassword.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }
  if (password !== confirmPassword) {
    return {
      error: "Password do not match",
    };
  }

  // Hashing password
  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const userId = generateIdFromEntropySize(10); // 16 characters long

  // TODO: check if username is already used
  await db.insert(users).values({
    id: userId,
    username: username,
    email: email.toString(),
    passwordHash: passwordHash,
  });

  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()));

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

interface ActionResult {
  error: string;
}
