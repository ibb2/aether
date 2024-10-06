import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PHProvider } from "./providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import PrivacyConsent from "@/components/Consent/Privacy";
import dynamic from "next/dynamic";

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

const PostHogPageView = dynamic(() => import("./PostHogPageView"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-svh" suppressHydrationWarning>
      <PHProvider>
        <body
          className={
            (inter.className, "flex min-h-svh items-center justify-center")
          }
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <PostHogPageView />
            <PrivacyConsent />
            {children}
          </ThemeProvider>
        </body>
      </PHProvider>
    </html>
  );
}
