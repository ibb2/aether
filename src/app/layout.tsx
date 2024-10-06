import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "@/db/db";
import posthog from "posthog-js";
import PostHogPageView from "./PostHogPageView";
import { PHProvider } from "./providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aether",
  description: "aether - a traditonal notetaking experience",
  keywords: [
    "notebook",
    "notes",
    "notion",
    "onenote",
    "ink",
    "pen",
    "e2ee",
    "encryption",
  ],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-svh" suppressHydrationWarning>
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
      {/* <PHProvider> */}
      <body
        className={
          (inter.className, "flex min-h-svh items-center justify-center")
        }
      >
        {/* <Suspense> */}
        {/* <PostHogPageView /> */}
        {children}
        {/* </Suspense> */}
      </body>
      {/* </PHProvider> */}
      {/* </ThemeProvider>  */}
    </html>
  );
}
