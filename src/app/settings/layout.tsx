'use client'

import { SessionProvider } from 'next-auth/react'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { EvoluProvider } from '@evolu/react'
import { evolu } from '@/db/db'
import React from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Editor } from '@tiptap/react'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import useSidebarStore from '@/store/sidebar'
import { ImperativePanelHandle } from 'react-resizable-panels'
import useStateStore from '@/store/state'
import useResizeObserver from 'use-resize-observer'
import { ArrowLeft, Link } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SettingsSidebar } from '@/components/Sidebar/SettingsSidebar'

export default function AppLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <EvoluProvider value={evolu}>
            <SessionProvider>
                <ResizablePanelGroup
                    direction="horizontal"
                    className="flex h-full align-self self-start"
                >
                    {/* Include shared UI here e.g. a header or sidebar */}
                    <ResizablePanel
                        defaultSize={20}
                        collapsible={false}
                        maxSize={50}
                    >
                        <SettingsSidebar />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel className="flex-1" defaultSize={80}>
                        <div className="h-full">{children}</div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </SessionProvider>
        </EvoluProvider>
    )
}
