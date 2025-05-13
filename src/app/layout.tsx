import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/index.css'
import { PHProvider } from './providers'
import { ThemeProvider } from '@/components/providers/theme-provider'
import dynamic from 'next/dynamic'
import { EvoluProvider } from '@evolu/react'
import { evolu } from '@/db/db'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SessionProvider } from 'next-auth/react'
import { EditorProvider } from '@tiptap/react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Toaster } from '@/components/ui/toaster'

// import ClientComponents from "@/components/Layout/ClientComponents";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: 'Aethernotes',
        template: '%s | Aethernotes',
    },
    description:
        'Aethernotes is a secure, end-to-end encrypted note-taking app that combines the intuitive feel of handwriting with the structure of block-based organization.',
    keywords: [
        'Aethernotes',
        'note-taking app',
        'handwriting notes',
        'block-based organization',
        'end-to-end encryption',
        'secure notes',
        'digital notebook',
        'Think in Ink',
        'Organize in Blocks',
    ],
    metadataBase: new URL(
        process.env.VERCEL_URL
            ? 'https://' + process.env.VERCEL_URL
            : 'http://localhost:3000'
    ),
    openGraph: {
        title: 'Think in Ink. Organize in Blocks | Aethernotes',
        description:
            'Aethernotes is a secure, end-to-end encrypted note-taking app that combines the intuitive feel of handwriting with the structure of block-based organization.',
        url: process.env.VERCEL_URL
            ? 'https://' + process.env.VERCEL_URL
            : 'http://localhost:3000',
        siteName: 'Aethernotes',
        images: [''],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Think in Ink. Organize in Blocks | Aethernotes',
        description:
            'Aethernotes is a secure, end-to-end encrypted note-taking app that combines the intuitive feel of handwriting with the structure of block-based organization.',
        images: [''],
        creator: '@aethernotes',
    },
    alternates: {
        canonical: process.env.VERCEL_URL
            ? 'https://' + process.env.VERCEL_URL
            : 'http://localhost:3000',
    },
    robots: {
        index: true,
        follow: true,
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
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    return (
        <html
            lang="en"
            className={`${inter.className} min-h-svh`}
            suppressHydrationWarning
        >
            <head>
                {process.env.VERCEL_ENV !== 'production' && (
                    <script
                        src="https://unpkg.com/react-scan/dist/auto.global.js"
                        async
                    />
                )}
                <script
                    async
                    src="https://js.stripe.com/v3/pricing-table.js"
                ></script>
            </head>
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
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
