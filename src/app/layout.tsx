import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PHProvider } from './providers'
import { ThemeProvider } from '@/components/providers/theme-provider'
import dynamic from 'next/dynamic'
import { EvoluProvider } from '@evolu/react'
import { evolu } from '@/db/db'
import { ClerkProvider } from '@clerk/nextjs'

// import ClientComponents from "@/components/Layout/ClientComponents";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Aether',
    description: 'aether - a traditional notetaking experience',
    keywords: [
        'notebook',
        'notes',
        'notion',
        'onenote',
        'ink',
        'pen',
        'e2ee',
        'encryption',
    ],
    robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
        googleBot: 'index, follow',
    },
}

// Dynamically import client-side components
const ClientComponents = dynamic(
    () => import('../components/Layout/ClientComponents'),
    {
        ssr: false,
    }
)

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ClerkProvider>
            <html
                lang="en"
                className={`${inter.className} min-h-svh`}
                suppressHydrationWarning
            >
                <body className="flex min-h-svh items-center justify-center">
                    <PHProvider>
                        <EvoluProvider value={evolu}>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                            >
                                <ClientComponents>{children}</ClientComponents>
                            </ThemeProvider>
                        </EvoluProvider>
                    </PHProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
