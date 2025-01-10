'use client'

import * as S from '@effect/schema/Schema'
import { Brand } from 'effect/Brand'

import {
    BubbleMenu,
    EditorContent,
    PureEditorContent,
    useCurrentEditor,
    useEditor,
} from '@tiptap/react'
import { Editor } from '@tiptap/core'
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { LinkMenu } from '@/components/menus'

import { useBlockEditor } from '@/hooks/useBlockEditor'

import '@/styles/index.css'

import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu'
import { ColumnsMenu } from '@/extensions/MultiColumn/menus'
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus'
import { TiptapProps } from './types'
import { EditorHeader } from './components/EditorHeader'
import { TextMenu } from '../menus/TextMenu'
import { ContentItemMenu } from '../menus/ContentItemMenu'
import { useEvolu, useQueries, useQuery } from '@evolu/react'
import { evolu, type Database } from '@/db/db'
import useNoteStore from '@/store/note'
import {
    CanvasPathArray,
    CanvasPathSchema,
    NonEmptyString50,
    NoteId,
    SettingId,
} from '@/db/schema'
import { useDebounce, useDebouncedCallback } from 'use-debounce'

import { cn } from '@/lib/utils'
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas'
import useSidebarStore from '@/store/sidebar'
import { useTheme } from 'next-themes'
import { settingQuery } from '@/db/queries'
import { convertCanvasPathsForDatabase } from '@/lib/utils/convertCanvasPaths'
import ExtensionKit from '@/extensions/extension-kit'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import { Doc as YDoc } from 'yjs'

export const BlockEditor = forwardRef<ReactSketchCanvasRef, TiptapProps>(
    ({ ydoc, provider }, canvasRef) => {
        const menuContainerRef = useRef<HTMLDivElement>(null)

        // State
        const [readOnly, setReadOnly] = React.useState(false)
        const [load, onLoad] = React.useState(0)
        const [sidebarSize, setSidebarSize] = React.useState(0)

        // Themes
        const { theme } = useTheme()

        // Evolu
        const { create } = useEvolu<Database>()

        // Zustand Stores
        const { item } = useNoteStore((state) => ({
            item: state.item,
        }))

        const { open, ref, setOpen } = useSidebarStore((state) => ({
            open: state.open,
            ref: state.ref,
            setOpen: state.setOpen,
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
        const [exportedData, settings] = useQueries([
            exportedDataQuery(),
            settingQuery,
        ])

        if (settings.row === null || settings.row === undefined) {
            create('settings', {
                title: S.decodeSync(NonEmptyString50)('settings'),
            })
        }

        /**
         * This effect is used to load ink data into the canvas and save ink data from the canvas to the database.
         * It runs when the component mounts or updates.
         *
         * @return {void}
         */
        // React.useEffect(() => {
        //     // Load ink data into the canvas if the load state is 0 and an item with an id exists
        //     if (load === 0) {
        //         if (item?.id) {
        //             const data = exportedData.rows.find(
        //                 (row) => row.noteId === S.decodeSync(NoteId)(item.id)
        //             )
        //             if (data?.inkData && Array.isArray(data.inkData)) {
        //                 canvasRef?.current?.loadPaths(
        //                     data.inkData as unknown as import('react-sketch-canvas').CanvasPath[]
        //                 )
        //             }
        //         }
        //     }

        //     // Save ink data from the canvas to the database using the debouncedInkSave function
        //     if (canvasRef?.current) {
        //         debouncedInkSave(canvasRef?.current)
        //     }
        // }, [debouncedInkSave, load, exportedData.rows, item])

        // Note info

        const [noteContent, setNoteContent] = useState<any>()

        useEffect(() => {
            if (item === null) return
            const data = exportedData.rows.find(
                (row) => row.noteId === S.decodeSync(NoteId)(item.id)
            )
            setNoteContent(data)
        }, [item, exportedData.rows])

        const { users, characterCount, collabState, editor } = useBlockEditor({
            provider,
        })

        React.useEffect(() => {
            const changeExistingStrokeColor = async () => {
                if (canvasRef?.current) {
                    // Get current paths
                    const paths = await canvasRef?.current.exportPaths()

                    // Modify the color of all paths
                    const updatedPaths = paths.map((path) => ({
                        ...path,
                        strokeColor: theme === 'light' ? 'black' : 'white',
                    }))

                    // Clear the canvas
                    await canvasRef?.current.clearCanvas()

                    // Load the modified paths
                    await canvasRef?.current.loadPaths(updatedPaths)
                }
            }
            changeExistingStrokeColor()
        }, [theme])

        const reactSketchCanvasClass = cn(
            'absolute',
            readOnly && 'z-0'
            // !readOnly && 'z-1'
        )

        const editorClass = cn(
            'w-full overflow-y-auto border-0',
            readOnly && 'z-1',
            !readOnly && '-z-10'
        )

        const collapsePanel = () => {
            if (ref === null) return
            const panel = ref.current
            setOpen()
            if (panel) {
                if (!panel.isCollapsed()) {
                    setSidebarSize(panel.getSize())
                    panel.collapse()
                } else {
                    panel.expand(sidebarSize)
                }
            }
        }

        if (!editor) {
            return null
        }

        return (
            <div className="flex flex-col relative w-auto h-full border-0 overflow-hidden">
                <MemoizedEditorHeader
                    characters={characterCount.characters()}
                    words={characterCount.words()}
                    isSidebarOpen={open}
                    toggleSidebar={collapsePanel}
                    canvasRef={canvasRef?.current}
                    readOnly={readOnly}
                    setReadOnly={setReadOnly}
                />
                <ReactSketchCanvas
                    ref={canvasRef}
                    readOnly={readOnly}
                    height="100%"
                    style={{ border: 0 }}
                    canvasColor="transparent"
                    strokeColor={theme === 'light' ? 'black' : 'white'}
                    className={reactSketchCanvasClass}
                    // onChange={() => {
                    //     if (canvasRef?.current) {
                    //         debouncedInkSave(canvasRef?.current)
                    //     }
                    // }}
                    withTimestamp
                />
                <MemoizedEditorContent
                    editor={editor}
                    className={editorClass}
                />
                <ContentItemMenu editor={editor} />
                <LinkMenu editor={editor} appendTo={menuContainerRef} />
                <TextMenu editor={editor} />
                <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
                <TableRowMenu editor={editor} appendTo={menuContainerRef} />
                <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
                <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
            </div>
        )
    }
)

const MemoizedEditorHeader = React.memo(
    ({
        characters,
        words,
        isSidebarOpen,
        toggleSidebar,
        canvasRef,
        readOnly,
        setReadOnly,
    }: {
        characters: number
        words: number
        isSidebarOpen: boolean
        toggleSidebar: () => void
        canvasRef: HTMLCanvasElement | null
        readOnly: boolean
        setReadOnly: (value: boolean) => void
    }) => {
        return (
            <EditorHeader
                characters={characters}
                words={words}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                canvasRef={canvasRef}
                readOnly={readOnly}
                setReadOnly={setReadOnly}
            />
        )
    }
)

MemoizedEditorHeader.displayName = 'MemoizedEditorHeader'

const MemoizedEditorContent = React.memo(
    ({ editor, className }: { editor: any; className?: string }) => {
        return <EditorContent editor={editor} className={className} />
    }
)

MemoizedEditorContent.displayName = 'MemoizedEditorContent'

BlockEditor.displayName = 'BlockEditor'

export default BlockEditor
