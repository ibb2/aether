'use client'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import 'iframe-resizer/js/iframeResizer.contentWindow'
import { useSearchParams } from 'next/navigation'
import {
    forwardRef,
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

type DocumentProps = {
    params: { room: string }
}

export const Document = forwardRef<ReactSketchCanvasRef, DocumentProps>(
    ({ params }, canvasRef) => {
        const { theme, setTheme } = useTheme()
        const [provider, setProvider] = useState<TiptapCollabProvider | null>(
            null
        )
        const [collabToken, setCollabToken] = useState<string | null>(null)
        const searchParams = useSearchParams()

        const hasCollab = parseInt(searchParams.get('noCollab') as string) !== 1

        const { room } = params

        const ydoc = useMemo(() => new YDoc(), [])

        const { data: session } = useSession()

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

        useLayoutEffect(() => {
            if (hasCollab && collabToken) {
                setProvider(
                    new TiptapCollabProvider({
                        name: `${process.env.NEXT_PUBLIC_COLLAB_DOC_PREFIX}${room}`,
                        appId:
                            process.env.NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID ?? '',
                        token: collabToken,
                        document: ydoc,
                    })
                )
            }
        }, [setProvider, collabToken, ydoc, room, hasCollab])

        // if (hasCollab && (!collabToken || !provider)) return;

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
                <MemoizedBlockEditor
                    hasCollab={hasCollab}
                    ydoc={ydoc}
                    provider={provider}
                    ref={canvasRef}
                />
            </>
        )
    }
)

Document.displayName = 'Document'

export default Document
