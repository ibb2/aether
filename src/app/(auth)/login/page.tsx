"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { login } from "@/actions/auth/login";
import { useFormState } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

export const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "username must be at least 3 characters long" })
    .max(100, { message: "username too long" })
    .nonempty({ message: "username required" }),
  password: z
    .string()
    .min(8, { message: "password must be 8 characters long" })
    .max(255, { message: "password is too long" })
    .nonempty({ message: "password required" }),
});

export type LoginSchema = z.infer<typeof formSchema>;

export default function Page() {
  const [state, formAction] = useFormState(login, {
    // message: "",
    error: "",
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <Card className="flex flex-col p-0 content-center items-center justify-center w-[500px] ">
      <CardHeader className="items-center">
        <CardTitle>Login</CardTitle>
        <CardDescription>Login in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {state?.error !== "" && (
          <Alert variant="destructive">
            {/* <AlertCircle className="h-4 w-4" /> */}
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(() => formRef.current?.submit())}
            action={formAction}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="password" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <CardDescription>
          Don&apost have an account?{" "}
          <Link
            href="signup"
            className="underline text-zinc-600 hover:text-zinc-800"
          >
            Sign up.
          </Link>
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
