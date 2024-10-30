'use client'

import React, { memo } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { SessionProvider } from 'next-auth/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

// Memoize the Sidebar component
const MemoizedSidebar = memo(Sidebar)

export default function AppLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <TooltipProvider>
            <SessionProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>{children}</SidebarInset>
                </SidebarProvider>
            </SessionProvider>
        </TooltipProvider>
    )
}
