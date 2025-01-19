import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PHProvider } from './providers'
import { ThemeProvider } from '@/components/providers/theme-provider'
import dynamic from 'next/dynamic'
import { EvoluProvider } from '@evolu/react'
import { evolu } from '@/db/db'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SessionProvider } from 'next-auth/react'
import { EditorProvider } from '@tiptap/react'
import { auth } from '@/auth'

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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const session = await auth()

    return (
        <html
            lang="en"
            className={`${inter.className} min-h-svh`}
            suppressHydrationWarning
        >
            <head>
                <script
                    async
                    src="https://js.stripe.com/v3/pricing-table.js"
                ></script>
            </head>
            <body className="flex min-h-svh items-center justify-center">
                <PHProvider>
                    <SessionProvider session={session}>
                        <EvoluProvider value={evolu}>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                            >
                                <ClientComponents>{children}</ClientComponents>
                            </ThemeProvider>
                        </EvoluProvider>
                    </SessionProvider>
                </PHProvider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
