import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validateRequest } from "@/lib/auth/validateRequests";
import { ActionResult } from "next/dist/server/app-render/types";
import { Button } from "@/components/ui/Button";

export default async function Page() {
  return (
    <form action={logout}>
      <Button variant="destructive">Sign out</Button>
    </form>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
}
