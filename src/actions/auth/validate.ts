"use server";

import { validateRequest } from "@/lib/auth/validateRequests";
import { redirect } from "next/navigation";

export async function getUser() {
  const { user, session } = await validateRequest();

  // if (!user) {
  //   // redirect("/login");
  //   return { user, session };
  // }

  return { user, session };
}
