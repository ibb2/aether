'use client'

import * as S from '@effect/schema/Schema'
import React, { memo, useLayoutEffect, useMemo, useState } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { Doc as YDoc } from 'yjs'
import { AppSidebar } from '@/components/app-sidebar'
import { Editor, EditorProvider, useEditor } from '@tiptap/react'
import { initialContent } from '@/lib/data/initialContent'
import ExtensionKit from '@/extensions/extension-kit'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import { useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { settingQuery } from '@/db/queries'
import { useEvolu, useQueries, useQuery } from '@evolu/react'
import { NonEmptyString50 } from '@/db/schema'
import { Database, evolu } from '@/db/db'
import useNoteStore from '@/store/note'
import useSidebarStore from '@/store/sidebar'

// Memoize the Sidebar component

export default function AppLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)
    const [collabToken, setCollabToken] = useState<string | null>(null)
    const searchParams = useSearchParams()

    const hasCollab = parseInt(searchParams.get('noCollab') as string) !== 1

    const room = 0

    const ydoc = useMemo(() => new YDoc(), [])

    const { data: session } = useSession()

    useLayoutEffect(() => {
        if (hasCollab && collabToken) {
            setProvider(
                new TiptapCollabProvider({
                    name: `${process.env.NEXT_PUBLIC_COLLAB_DOC_PREFIX}${room}`,
                    appId: process.env.NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID ?? '',
                    token: collabToken,
                    document: ydoc,
                })
            )
        }
    }, [setProvider, collabToken, ydoc, room, hasCollab])

    // Editor related
    // Evolu
    const { create, update } = useEvolu<Database>()

    // Zustand Stores
    const { item } = useNoteStore((state) => ({
        item: state.item,
    }))

    const exportedDataQuery = React.useCallback(() => {
        return evolu.createQuery((db) =>
            db
                .selectFrom('exportedData')
                .select('id')
                .select('jsonData')
                .select('noteId')
                .select('inkData')
        )
    }, [])

    // Use the query result here
    const exportedData = useQuery(exportedDataQuery())

    /* 
    Section related to code for handeling the saving or both note data and ink data
    */

    const saveData = React.useCallback(
        /*
        Exports and saves note data into the exportedData table
        */
        (editor: Editor) => {
            if (item === null || !editor) return

            const data = exportedData.rows.find((row) => row.noteId === item.id)

            if (data === undefined || data === null) return

            const content = editor.getJSON()

            update('exportedData', {
                id: data.id,
                jsonData: content,
            })
        },
        [item, exportedData.rows, update]
    )

    const debouncedSave = useDebouncedCallback(saveData, 2000)

    return (
        <TooltipProvider>
            <EditorProvider
                autofocus={true}
                immediatelyRender={true}
                content={initialContent}
                extensions={[
                    ...ExtensionKit({
                        provider,
                    }),
                ]}
                editorProps={{
                    attributes: {
                        autocomplete: 'off',
                        autocorrect: 'off',
                        autocapitalize: 'off',
                        class: 'min-h-full',
                    },
                }}
                onUpdate={(props) => {
                    debouncedSave(props.editor)
                }}
            >
                <SessionProvider>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>{children}</SidebarInset>
                    </SidebarProvider>
                </SessionProvider>
            </EditorProvider>
        </TooltipProvider>
    )
}
