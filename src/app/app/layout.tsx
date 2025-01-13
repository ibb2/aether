'use client'

import * as S from '@effect/schema/Schema'
import React, {
    memo,
    useLayoutEffect,
    useMemo,
    useState,
    useCallback,
} from 'react'
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
import { ReactSketchCanvasRef } from 'react-sketch-canvas'
import Document from '@/app/app/page'

// Memoize the Sidebar component

export default function AppLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    const canvasRef = React.useRef<ReactSketchCanvasRef>(null)

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

    let delay = true

    /**
     * Exports and saves note data into the exportedData table
     */
    const saveData = React.useCallback(
        /**
         * Saves the current editor content into the exportedData table
         * @param editor The Tiptap editor instance
         */
        (editor: Editor) => {
            if (item === null || !editor) return

            const data = exportedData.rows.find((row) => row.noteId === item.id)

            const { from, to } = editor.state.selection

            if (data === undefined || data === null) return

            const content = editor.getJSON()

            update('exportedData', {
                id: data.id,
                jsonData: content,
            })

            delay = true

            editor.commands.setTextSelection({ from, to })
            delay = false
            // editor.commands.focus()
        },
        [item, exportedData.rows, update]
    )

    const debouncedSave = useDebouncedCallback(saveData, 2000)

    // const saveInkData = React.useCallback(
    //     async (canvasRef: ReactSketchCanvasRef) => {
    //         if (item === null) return
    //         const data = exportedData.rows.find(
    //             (row) => row.noteId === item.id
    //         )

    //         if (
    //             data === undefined ||
    //             data === null ||
    //             canvasRef === null
    //         )
    //             return

    //         const time = await canvasRef?.getSketchingTime()
    //         const paths = await canvasRef?.exportPaths()

    //         const cleanedData = convertCanvasPathsForDatabase(paths)

    //         update('exportedData', {
    //             id: data.id,
    //             inkData: S.decodeSync(CanvasPathArray)(cleanedData),
    //         })
    //     },
    //     [item, exportedData.rows, update]
    // )
    // const debouncedInkSave = useDebouncedCallback(saveInkData, 1000)

    // Memoize the params object to ensure stability
    const params = useMemo(
        () => ({
            room: '',
        }),
        []
    )

    // Memoize editorProps to prevent unnecessary re-renders
    const editorProps = useMemo(
        () => ({
            attributes: {
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                class: 'min-h-full',
            },
        }),
        []
    )

    // Memoize extensions to ensure they are stable across renders
    const extensions = useMemo(
        () => [
            ...ExtensionKit({
                provider,
            }),
        ],
        [provider]
    )

    // Memoize the onUpdate handler
    const handleUpdate = useCallback(
        (props) => {
            debouncedSave(props.editor)
        },
        [debouncedSave]
    )

    // Memoize the SidebarProvider to prevent unnecessary re-renders
    const memoizedSidebar = useMemo(
        () => (
            <TooltipProvider>
                <SessionProvider>
                    <SidebarProvider>
                        <AppSidebar canvasRef={canvasRef} />
                        <SidebarInset>
                            <EditorProvider
                                autofocus={true}
                                immediatelyRender={true}
                                shouldRerenderOnTransaction={false}
                                extensions={extensions}
                                editorProps={editorProps}
                                onUpdate={handleUpdate}
                            >
                                {React.isValidElement(children)
                                    ? React.cloneElement(children, {
                                          ref: canvasRef,
                                      })
                                    : children}
                            </EditorProvider>
                        </SidebarInset>
                    </SidebarProvider>
                </SessionProvider>
            </TooltipProvider>
        ),
        [canvasRef, params]
    )

    return (
        <TooltipProvider>
            <SessionProvider>
                <SidebarProvider>
                    <AppSidebar canvasRef={canvasRef} />
                    <SidebarInset>
                        <EditorProvider
                            autofocus={true}
                            immediatelyRender={true}
                            shouldRerenderOnTransaction={false}
                            extensions={extensions}
                            editorProps={editorProps}
                            onUpdate={handleUpdate}
                        >
                            {React.isValidElement(children)
                                ? React.cloneElement(children, {
                                      ref: canvasRef,
                                  })
                                : children}
                        </EditorProvider>
                    </SidebarInset>
                </SidebarProvider>
            </SessionProvider>
        </TooltipProvider>
    )
}
