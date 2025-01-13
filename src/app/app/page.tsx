'use client'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import 'iframe-resizer/js/iframeResizer.contentWindow'
import { useSearchParams } from 'next/navigation'
import {
    forwardRef,
    use,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react'
import { Doc as YDoc } from 'yjs'

import { BlockEditor } from '@/components/BlockEditor'
import { createPortal } from 'react-dom'
import { Surface } from '@/components/ui/Surface'
import { Toolbar } from '@/components/ui/Toolbar'
import { Icon } from '@/components/ui/Icon'
import { EvoluProvider } from '@evolu/react'
import { evolu } from '@/db/db'
import { useTheme } from 'next-themes'
import React from 'react'
import { useSession } from 'next-auth/react'
import { db } from '@/db/drizzle'
import { ReactSketchCanvasRef } from 'react-sketch-canvas'
import useEditorStore from '@/store/editor'
import { useCurrentEditor, useEditorState } from '@tiptap/react'

type DocumentProps = {
    params: { room: string }
}

export const Document = forwardRef<ReactSketchCanvasRef>((canvasRef) => {
    const { theme, setTheme } = useTheme()

    const { data: session } = useSession()

    const setEditor = useEditorStore((s) => s.setEditor)

    const { editor } = useCurrentEditor()
    setEditor(editor)

    useEffect(() => {
        if (session?.user) {
            // Send Evolu ID and NextAuth user ID to your Turso DB via an API route
            fetch('/api/evolu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: session.user.email,
                    evoluOwnerId: evolu.getOwner()?.id,
                }),
            })
        }
    }, [session?.user])

    const MemoizedBlockEditor = React.memo(BlockEditor)

    const lightTheme = React.useMemo(() => {
        return () => setTheme('light')
    }, [setTheme])

    const darkTheme = React.useMemo(() => {
        return () => setTheme('dark')
    }, [setTheme])

    const DarkModeSwitcher = createPortal(
        <Surface className="flex items-center gap-1 fixed bottom-6 right-6 z-[99999] p-1">
            <Toolbar.Button onClick={lightTheme} active={theme === 'light'}>
                <Icon name="Sun" />
            </Toolbar.Button>
            <Toolbar.Button onClick={darkTheme} active={theme === 'dark'}>
                <Icon name="Moon" />
            </Toolbar.Button>
        </Surface>,
        document.body
    )

    return (
        <>
            {DarkModeSwitcher}
            <MemoizedBlockEditor ref={canvasRef} />
        </>
    )
})

Document.displayName = 'Document'

export default Document
