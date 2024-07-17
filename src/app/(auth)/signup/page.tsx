"use client";

import * as S from "@effect/schema/Schema";

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
import { signup } from "@/actions/auth/signup";
import { useFormState } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

// const Email = S.pattern(
//   /^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i,
//   { message: () => "email is not valid" },
// );

// const schema = S.Struct({
//   username: S.String.pipe(
//     S.minLength(3, {
//       message: () => "username must be at least 3 characters long",
//     }),
//     S.maxLength(100, { message: () => "username too long" }),
//     S.nonEmpty({ message: () => "username required" }),
//   ),
//   email: S.String.pipe(Email, S.nonEmpty({ message: () => "email required" })),
//   password: S.String.pipe(
//     S.minLength(8, { message: () => "password must be 8 characters long" }),
//     S.maxLength(255, { message: () => "password is too long" }),
//     S.nonEmpty({ message: () => "password required" }),
//   ),
//   confirmPassword: S.String.pipe(
//     S.minLength(8, { message: () => "password must be 8 characters long" }),
//     S.maxLength(255, { message: () => "password is too long" }),
//     S.nonEmpty({ message: () => "password required" }),
//   ),
// }).pipe(
//   S.filter((input) => {
//     if (input.password !== input.confirmPassword) {
//       return {
//         path: ["confirmPassword"],
//         message: "Passwords do not match",
//       };
//     }
//   }),
// );

// const zodSchema = z.object({
//   name: z.string().min(1, { message: "Required" }),
//   age: z.number().min(10),
// });

export const formSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "username must be at least 3 characters long" })
      .max(100, { message: "username too long" })
      .nonempty({ message: "username required" }),
    email: z
      .string()
      .trim()
      .email({ message: "email is not valid" })
      .nonempty({ message: "email required" }),
    password: z
      .string()
      .min(8, { message: "password must be 8 characters long" })
      .max(255, { message: "password is too long" })
      .nonempty({ message: "password required" }),
    confirmPassword: z
      .string()
      .min(8, { message: "password must be 8 characters long" })
      .max(255, { message: "password is too long" })
      .nonempty({ message: "password required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => typeof data.email === "string");

export type SignupSchema = z.infer<typeof formSchema>;

export default function Page() {
  const [state, formAction] = useFormState(signup, {
    // message: "",
    error: "",
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("confirmPassword", values.confirmPassword);
  }

  return (
    <Card className="flex flex-col p-0 content-center items-center justify-center w-[500px] ">
      <CardHeader className="items-center">
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Sign up for an account.</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {state?.error !== "" && (
          <Alert variant="destructive">
            {/* <AlertCircle className="h-4 w-4" /> */}
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@address.com" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="confirm password" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <CardDescription>
          Already have an account?{" "}
          <Link
            href="login"
            className="underline text-zinc-600 hover:text-zinc-800"
          >
            login
          </Link>
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
