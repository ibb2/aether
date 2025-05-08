'use client'

import * as S from '@effect/schema/Schema'
import React, {
    memo,
    useLayoutEffect,
    useMemo,
    useState,
    useCallback,
    RefObject,
} from 'react'
import { useSession } from '@/lib/auth-client'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { Doc as YDoc } from 'yjs'
import { AppSidebar } from '@/components/app-sidebar'
import { Editor, EditorProvider, useEditor } from '@tiptap/react'
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditorHeader } from '@/components/BlockEditor/components/EditorHeader'
import { Cone } from 'lucide-react'
import { releaseVersion_0_4_0 } from '@/lib/data/whats-new/release-v0.4.0'
import { releaseVersion_0_4_1 } from '@/lib/data/whats-new/release-v0.4.1'
import Cookies from 'js-cookie'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import BlankPage from '@/components/notes/blankPage'

const queryClient = new QueryClient()

const VERSION = process.env.NEXT_PUBLIC_VISITED_VERSION
const COOKIE_NAME = `hasVisited_${VERSION}`
const DEFAULT_CONTENT = '<h1></h1><p></p>'

export default function AppLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    const canvasRef = React.useRef<ReactSketchCanvasRef>(null)

    const owner = useEvolu().getOwner()
    const evoluId = owner ? S.decodeSync(S.String)(owner?.id) : null

    const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)
    const [collabToken, setCollabToken] = useState<string | null>(null)
    const searchParams = useSearchParams()

    const hasCollab = parseInt(searchParams.get('noCollab') as string) !== 1

    const room = 0

    const ydoc = useMemo(() => new YDoc(), [])

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

    // Check synchronously if we’re in a browser and if the cookie exists.
    const isClient = typeof window !== 'undefined'
    const initialFirstVisit = isClient ? !Cookies.get(COOKIE_NAME) : false

    // Initialize state with the computed value.
    const [isFirstVisit, setIsFirstVisit] = useState(initialFirstVisit)
    const [hasNewUpdate] = useState(true) // Adjust this flag based on your update logic.

    // In a useEffect, set the cookie if it's the first visit.
    React.useEffect(() => {
        if (isClient && isFirstVisit) {
            Cookies.set(COOKIE_NAME, 'true', {
                path: '/',
                expires: 30, // Cookie expires in 30 days.
            })
        }
    }, [isClient, isFirstVisit])

    // Editor related
    // Evolu
    const { update } = useEvolu<Database>()

    // Zustand Stores
    const { item, exportedId, noteId, type } = useNoteStore((state) => ({
        item: state.item,
        exportedId: state.id,
        noteId: state.noteId,
        type: state.type,
    }))

    /**
     * Exports and saves note data into the exportedData table
     */
    const saveData = React.useCallback(
        /**
         * Saves the current editor content into the exportedData table
         * @param editor The Tiptap editor instance
         */
        (editor: Editor) => {
            if (item === null || !editor || exportedId === null) return

            const content = editor.getJSON()

            update('exportedData', {
                id: exportedId,
                jsonData: content,
            })
        },
        [item, update, exportedId]
    )

    const debouncedSave = useDebouncedCallback(saveData, 500) // Allow use to adjust this setting?

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

    // Memoize the delete handler till extension is released
    const [previousImages, setPreviousImages] = useState<string[]>([])
    const [imagesList, setImagesList] = useState<string[]>([])

    // const handleImageDelete = useCallback(
    //     async (props: { editor: Editor }) => {
    //         console.log('❌ Deleting')
    //         const editor = props.editor
    //         setContent(editor.getJSON())
    //         console.log(editor.getJSON())
    //         const currentImages: { src: string; fileId: string }[] = []
    //         editor.getJSON().content?.forEach((item) => {
    //             if (
    //                 item.type === 'image' &&
    //                 item.attrs?.src &&
    //                 item.attrs?.fileId
    //             ) {
    //                 currentImages.push({
    //                     src: item.attrs.src,
    //                     fileId: item.attrs.fileId,
    //                 })
    //             }
    //         })
    //         const deletedImages = previousImages.filter(
    //             (url: string) =>
    //                 !currentImages.map((img) => img.src).includes(url)
    //         )
    //         for (const url of deletedImages) {
    //             console.log('Deleting image from blob storage:', url)
    //             const fileId = currentImages.find(
    //                 (img) => img.src === url
    //             )?.fileId
    //             await fetch(`/api/r2/upload?fileId=${fileId}&docId=${noteId}`, {
    //                 method: 'DELETE',
    //             })
    //         }

    //         setPreviousImages(currentImages.map((img) => img.src))
    //         setImagesList(currentImages.map((img) => img.src))
    //         console.log(currentImages)
    //     },
    //     [previousImages, noteId]
    // )
    //

    const content =
        isFirstVisit && hasNewUpdate
            ? releaseVersion_0_4_1 // Change on version bump
            : DEFAULT_CONTENT

    // Memoize the onUpdate handler
    const handleUpdate = useCallback(
        (props) => {
            debouncedSave(props.editor)
        },
        [debouncedSave]
    )

    const [readOnly, setReadOnly] = useState(false)

    return (
        <>
            <TooltipProvider>
                <SidebarProvider>
                    <QueryClientProvider client={queryClient}>
                        <AppSidebar canvasRef={canvasRef} id={evoluId!} />
                    </QueryClientProvider>
                    <SidebarInset>
                        <>
                            <EditorHeader
                                canvasRef={null}
                                readOnly={false}
                                setReadOnly={() => {}}
                            />
                            <div
                                className={
                                    type === 'Blank' ? 'hidden' : 'visible'
                                }
                            >
                                <EditorProvider
                                    editorContainerProps={{
                                        className: 'grow',
                                    }}
                                    autofocus={false}
                                    immediatelyRender={true}
                                    shouldRerenderOnTransaction={false}
                                    extensions={extensions}
                                    editorProps={editorProps}
                                    onUpdate={(props) => {
                                        handleUpdate(props)
                                        // await handleImageDelete(props)
                                    }}
                                    content={content}
                                >
                                    {React.isValidElement(children)
                                        ? React.cloneElement(children, {
                                              ref: canvasRef,
                                          })
                                        : children}
                                </EditorProvider>
                            </div>
                            <div
                                className={cn('flex h-full w-lvw', {
                                    invisible: type !== 'Blank',
                                    visible: type === 'Blank',
                                })}
                            >
                                {/* Add page component */}
                                <BlankPage ref={canvasRef} />
                            </div>
                        </>
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
            <Toaster />
        </>
    )
}

const MemoizedEditorHeader = React.memo(
    ({
        canvasRef,
        readOnly,
        setReadOnly,
    }: {
        canvasRef: RefObject<ReactSketchCanvasRef> | null
        readOnly: boolean
        setReadOnly: (value: boolean) => void
    }) => {
        return (
            <EditorHeader
                canvasRef={canvasRef}
                readOnly={readOnly}
                setReadOnly={setReadOnly}
            />
        )
    }
)

MemoizedEditorHeader.displayName = 'MemoizedEditorHeader'
