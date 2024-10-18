'use client'

import '../globals.css'
import { EvoluProvider } from '@evolu/react'
import { evolu } from '@/db/db'
import React, { memo, useCallback } from 'react'
import { Sidebar } from '@/components/Sidebar'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import useSidebarStore from '@/store/sidebar'
import { ImperativePanelHandle } from 'react-resizable-panels'

// Memoize the Sidebar component
const MemoizedSidebar = memo(Sidebar)

export default function AppLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    // Refs
    const menuContainerRef = React.useRef(null)
    const panelRef = React.useRef<ImperativePanelHandle>(null)

    // Const
    const MULTIPLE = 10.42553191

    // State
    const [width, setWidth] = React.useState(
        panelRef.current?.getSize() ?? 20 * MULTIPLE
    )

    // Store
    const { open, size, setOpen, adjustSize, setRef } = useSidebarStore(
        (state) => ({
            open: state.open,
            size: state.size,
            setOpen: state.setOpen,
            adjustSize: state.adjustSize,
            setRef: state.setRef,
        })
    )

    React.useEffect(() => {
        setRef(panelRef)
    }, [panelRef, setRef])

    // Memoize the onResize function
    const onResize = useCallback(
        (s) => {
            adjustSize(s)
            setWidth(s * MULTIPLE)
        },
        [adjustSize, MULTIPLE]
    )

    return (
        <EvoluProvider value={evolu}>
            <ResizablePanelGroup
                direction="horizontal"
                className="flex fixed h-full align-self self-start"
                ref={menuContainerRef}
            >
                {/* Include shared UI here e.g. a header or sidebar */}
                {open && (
                    <ResizablePanel
                        defaultSize={20}
                        collapsible
                        maxSize={50}
                        onResize={onResize} // Use the memoized function
                        ref={panelRef}
                    >
                        {/* Use the memoized Sidebar */}
                        <MemoizedSidebar />
                    </ResizablePanel>
                )}
                <ResizableHandle withHandle />
                <ResizablePanel className="flex-1">
                    <section className="h-full">{children}</section>
                </ResizablePanel>
            </ResizablePanelGroup>
        </EvoluProvider>
    )
}
