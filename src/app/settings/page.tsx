"use client";

import Link from "next/link";
import { ArrowLeft, CircleUser, Menu, Package2, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import React from "react";
import { createPortal } from "react-dom";
import { Surface } from "@/components/ui/Surface";
import { Toolbar } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import Copy from "@/components/copy/CopyLink";
import CopySecret from "@/components/copy/CopySecret";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "@/db/db";

export default function Settings() {
  const router = useRouter();

  return (
    <EvoluProvider value={evolu}>
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <div
            className="mx-auto flex flex-row items-center w-full max-w-6xl gap-4"
            onClick={() => router.back()}
          >
            <ArrowLeft />
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
          <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
            <nav
              className="grid gap-4 text-sm text-muted-foreground"
              x-chunk="dashboard-04-chunk-0"
            >
              <Link href="#" className="font-semibold text-primary">
                General
              </Link>
              {/* <Link href="#">Security</Link>
            <Link href="#">Integrations</Link>
            <Link href="#">Support</Link>
            <Link href="#">Organizations</Link> */}
              <Link href="/settings/advanced">Advanced</Link>
            </nav>
            <div className="grid gap-6">
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Account related settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <Label htmlFor="mnemonic">Mnemonic:</Label>
                    <CopySecret />
                    <div className="flex items-center space-x-2">
                      {/* <Checkbox id="include" defaultChecked /> */}
                      <label
                        htmlFor="include"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        This is what allows you to sync your encrypted notes, DO
                        NOT SHARE.
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </EvoluProvider>
  );
}
