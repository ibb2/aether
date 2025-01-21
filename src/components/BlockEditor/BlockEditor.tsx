'use client'

import * as S from '@effect/schema/Schema'
import { Brand } from 'effect/Brand'

import {
    BubbleMenu,
    EditorContent,
    EditorProvider,
    PureEditorContent,
    useCurrentEditor,
    useEditor,
} from '@tiptap/react'
import { Editor } from '@tiptap/core'
import React, {
    forwardRef,
    Suspense,
    useCallback,
    useEffect,
    useLayoutEffect,
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

export const BlockEditor = forwardRef((canvasRef) => {
    const menuContainerRef = useRef<HTMLDivElement>(null)

    const { editor } = useCurrentEditor()

    // States for React Sketch Canvas
    const [readOnly, setReadOnly] = useState(false)

    // State for Themes
    const { theme } = useTheme()

    // Evolu
    const { create } = useEvolu<Database>()

    // Use the query result here
    const settings = useQuery(settingQuery)

    if (settings.row === null || settings.row === undefined) {
        create('settings', {
            title: S.decodeSync(NonEmptyString50)('settings'),
        })
    }

    // Debounced effect to change stroke color based on theme
    const debouncedChangeExistingStrokeColor = useDebouncedCallback(
        async () => {
            if (canvasRef?.current) {
                // Get current paths
                const paths = await canvasRef.current.exportPaths()

                // Modify the color of all paths
                const updatedPaths = paths.map((path) => ({
                    ...path,
                    strokeColor: theme === 'light' ? 'black' : 'white',
                }))

                // Clear the canvas
                await canvasRef.current.clearCanvas()

                // Load the modified paths
                await canvasRef.current.loadPaths(updatedPaths)
            }
        },
        300
    )

    useEffect(() => {
        debouncedChangeExistingStrokeColor()
        // Cleanup on unmount
        return () => {
            debouncedChangeExistingStrokeColor.cancel()
        }
    }, [theme, debouncedChangeExistingStrokeColor])

    const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)
    const [collabToken, setCollabToken] = useState<string | null>(null)

    const hasCollab = 0
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

    // Editor related
    // Evolu
    const { update } = useEvolu<Database>()

    // Zustand Stores
    const { item, exportedId } = useNoteStore((state) => ({
        item: state.item,
        exportedId: state.id,
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
            console.log('Updating...')
        },
        [debouncedSave]
    )

    const reactSketchCanvasClass = useMemo(
        () => cn('absolute', readOnly && 'z-0'),
        [readOnly]
    )

    const editorClass = cn(
        'w-full overflow-y-auto border-0',
        readOnly && 'z-1',
        !readOnly && '-z-10'
    )

    const strokeColor = useMemo(
        () => (theme === 'light' ? 'black' : 'white'),
        [theme]
    )

    const canvasStyle = useMemo(() => ({ border: 0 }), [])

    if (!editor) {
        return null
    }

    return (
        // <EditorProvider
        //     autofocus={false}
        //     immediatelyRender={true}
        //     shouldRerenderOnTransaction={false}
        //     extensions={extensions}
        //     editorProps={editorProps}
        //     onUpdate={handleUpdate}
        //     onTransaction={(editor) => {
        //         console.log('Transacting')
        //         // const { from, to } = editor.state.selection
        //         // console.log('From and to:', from, to)
        //     }}
        // >
        <div className="flex flex-col relative w-auto h-full border-0 overflow-hidden">
            {/* <ReactSketchCanvas
                ref={canvasRef?.current}
                readOnly={readOnly}
                height="100%"
                style={canvasStyle}
                canvasColor="transparent"
                strokeColor={strokeColor}
                className={reactSketchCanvasClass}
                // onChange={() => {
                //     if (canvasRef?.current) {
                //         debouncedInkSave(canvasRef?.current)
                //     }
                // }}
                withTimestamp
            /> */}
            {/* <EditorContent editor={editor} className={editorClass} /> */}
            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} />
            <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
            <TableRowMenu editor={editor} appendTo={menuContainerRef} />
            <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
            <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
        </div>
        // </EditorProvider>
    )
})

BlockEditor.displayName = 'BlockEditor'

export default BlockEditor
