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

const useDarkmode = () => {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = React.useCallback(
    () => setIsDarkMode((isDark) => !isDark),
    [],
  );
  const lightMode = React.useCallback(() => setIsDarkMode(false), []);
  const darkMode = React.useCallback(() => setIsDarkMode(true), []);

  return {
    isDarkMode,
    toggleDarkMode,
    lightMode,
    darkMode,
  };
};

export default function Advanced() {
  const { isDarkMode, darkMode, lightMode } = useDarkmode();

  // darkMode();
  //
  const DarkModeSwitcher = createPortal(
    <Surface className="flex items-center gap-1 fixed bottom-6 right-6 z-[99999] p-1">
      <Toolbar.Button onClick={lightMode} active={!isDarkMode}>
        <Icon name="Sun" />
      </Toolbar.Button>
      <Toolbar.Button onClick={darkMode} active={isDarkMode}>
        <Icon name="Moon" />
      </Toolbar.Button>
    </Surface>,
    document.body,
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      {DarkModeSwitcher}
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <ArrowLeft />
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <Link href="/settings/general" className="hover:bg-zinc-700">
              General
            </Link>
            <Link href="#" className="font-semibold text-primary">
              Advanced
            </Link>
          </nav>
          <div className="grid gap-6">
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Danger</CardTitle>
                <CardDescription>
                  Proceed with extreme caution and care.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-6 w-min m-auto">
                <Button variant="destructive">
                  Show mnemonic (DO NOT SHARE)
                </Button>
                <Button variant="destructive">
                  Delete everything (Reset owner).
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
