'use client'

import React, { memo } from 'react'
import { SessionProvider } from 'next-auth/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

// Memoize the Sidebar component

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
