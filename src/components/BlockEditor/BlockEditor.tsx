'use client'

import * as S from '@effect/schema/Schema'
import { Brand } from 'effect/Brand'

import {
    BubbleMenu,
    EditorContent,
    PureEditorContent,
    useEditor,
} from '@tiptap/react'
import { Editor } from '@tiptap/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { LinkMenu } from '@/components/menus'

import { useBlockEditor } from '@/hooks/useBlockEditor'

import '@/styles/index.css'

import { Sidebar } from '@/components/Sidebar'
import { EditorContext } from '@/context/EditorContext'
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu'
import { ColumnsMenu } from '@/extensions/MultiColumn/menus'
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus'
import { TiptapProps } from './types'
import { EditorHeader } from './components/EditorHeader'
import { TextMenu } from '../menus/TextMenu'
import { ContentItemMenu } from '../menus/ContentItemMenu'
import { initialContent } from '@/lib/data/initialContent'
import { blankContent } from '@/lib/data/blankContent'
import ExtensionKit from '@/extensions/extension-kit'
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

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import { useSidebar } from '@/hooks/useSidebar'
import { cn } from '@/lib/utils'
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas'
import useSidebarStore from '@/store/sidebar'
import useStateStore from '@/store/state'
import { useTheme } from 'next-themes'
import { parse, stringify, toJSON, fromJSON } from 'flatted'
import { settingQuery } from '@/db/queries'

export const BlockEditor = ({ ydoc, provider }: TiptapProps) => {
    const menuContainerRef = useRef(null)
    const editorRef = useRef<PureEditorContent | null>(null)
    const canvasRef = React.useRef<ReactSketchCanvasRef>(null)

    // State
    const [lastSaveTime, setLastSaveTime] = React.useState(Date.now())
    const [lastInkedSaveTime, setLastInkedSaveTime] = React.useState(0)
    const [sidebarOpen, setSidebarOpen] = React.useState(true)
    const [readOnly, setReadOnly] = React.useState(false)
    const [load, onLoad] = React.useState(0)
    const [zIndex, setZIndex] = React.useState(0)
    const [sidebarSize, setSidebarSize] = React.useState(0)
    const [current, setCurrent] = React.useState<any>()

    // Themes
    const { theme, setTheme } = useTheme()

    // Evolu
    const { create, update } = useEvolu<Database>()

    // Zustand Stores
    const { setNote, item } = useNoteStore((state) => ({
        setNote: state.setNote,
        item: state.item,
    }))

    const { open, size, ref, setOpen, adjustSize, setRef } = useSidebarStore(
        (state) => ({
            open: state.open,
            size: state.size,
            ref: state.ref,
            setOpen: state.setOpen,
            adjustSize: state.adjustSize,
            setRef: state.setRef,
        })
    )

    const { users, characterCount, collabState } = useBlockEditor({
        ydoc,
        provider,
    })

    // Evolu
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

    // Get initial data
    // const getInitialData = async (editor: Editor) => {
    //     const {  } = exportedData.rows[0]
    //     setNote()
    //     editor.commands.setContent(jsonData!)
    //     console.log('Retrieved ink ')
    //     // await canvasRef.current?.loadPaths(inkData!);
    // }

    const customEditor = useEditor({
        extensions: [
            ...ExtensionKit({
                provider,
            }),
        ],
        onBeforeCreate({ editor }) {
            // Before the view is created.
        },
        onCreate({ editor }) {
            // The editor is ready.
        },
        onUpdate({ editor }) {
            debouncedSave(editor)
        },
        onSelectionUpdate({ editor }) {
            // The selection has changed.
        },
        onTransaction({ editor, transaction }) {
            // The editor state has changed.
        },
        onFocus({ editor, event }) {
            // The editor is focused.
        },
        onBlur({ editor, event }) {
            // The editor isn't focused anymore.
        },
        onDestroy() {
            // The editor is being destroyed.
        },
    })

    const saveData = React.useCallback(
        (editor: Editor) => {
            if (item === null || !editor) return
            const data = exportedData.rows.find((row) => row.noteId === item.id)
            if (data === undefined || data === null) return

            // Store selection before update
            const { from, to } = editor.state.selection

            const content = editor.getJSON()
            update('exportedData', {
                id: data.id,
                jsonData: content,
            })

            // Restore selection after update
            requestAnimationFrame(() => {
                if (editor.isFocused) {
                    editor.commands.setTextSelection({ from, to })
                }
            })

            setLastSaveTime(Date.now())
        },
        [item, exportedData.rows, update]
    )

    const debouncedSave = useDebouncedCallback(saveData, 2000)

    // Single effect to handle all content updates
    React.useEffect(() => {
        if (!customEditor || !item) return
        const data = exportedData.rows.find(
            (row) => row.noteId === S.decodeSync(NoteId)(item.id)
        )
        if (!data?.jsonData) return

        // Store selection
        const { from, to } = customEditor.state.selection

        // Update content with preservation options
        customEditor.commands.setContent(data.jsonData, false, {
            preserveWhitespace: 'full',
        })

        // Restore selection
        requestAnimationFrame(() => {
            if (customEditor.isFocused) {
                customEditor.commands.setTextSelection({ from, to })
            }
        })

        // Handle ink data
        if (canvasRef.current) {
            const ink = Array.isArray(data.inkData)
                ? (data.inkData as CanvasPath[])
                : null

            canvasRef.current.resetCanvas()
            if (ink) {
                canvasRef.current.loadPaths(ink)
            }
        }
    }, [customEditor, item, exportedData.rows])

    const transformCanvasPaths = (data): CanvasPathSchema[] => {
        return data.map((path) => ({
            drawMode: path.drawMode ?? false,
            startTimestamp: path.startTimestamp ?? 0,
            endTimestamp: path.endTimestamp ?? 0,
            paths: path.paths.map((p) => ({ x: p.x, y: p.y })) ?? [],
            strokeColor: path.strokeColor ?? '',
            strokeWidth: path.strokeWidth ?? 1,
        }))
    }

    const saveInkData = React.useCallback(
        async (canvasRef: ReactSketchCanvasRef) => {
            if (item === null) return
            const data = exportedData.rows.find((row) => row.noteId === item.id)

            if (data === undefined || data === null || canvasRef === null)
                return

            const prevTime = lastInkedSaveTime
            const time = await canvasRef.getSketchingTime()
            const paths = await canvasRef.exportPaths()

            const cleanedData = transformCanvasPaths(paths)

            update('exportedData', {
                id: data.id,
                inkData: S.decodeSync(CanvasPathArray)(cleanedData),
            })
            setLastInkedSaveTime(time)
            console.log(data)
        },
        [item, exportedData.rows, lastInkedSaveTime, update]
    )

    const debouncedInkSave = useDebouncedCallback(saveInkData, 1000)

    React.useEffect(() => {
        if (load === 0) {
            // getInitialData(editor);
            canvasRef.current?.loadPaths(ink)
            onLoad(1)
        }
        if (canvasRef.current) debouncedInkSave(canvasRef.current)
    }, [debouncedInkSave, load])

    React.useEffect(() => {
        if (item === null) return

        const data = exportedData.rows.find(
            (row) => row.noteId === S.decodeSync(NoteId)(item.id)
        )

        if (data === undefined || data === null) return

        const ink = Array.isArray(data.inkData)
            ? (data.inkData as CanvasPath[])
            : null

        if (canvasRef.current === null) {
            return
        }

        canvasRef.current.resetCanvas()
        canvasRef.current.resetCanvas()
        if (ink === null) return
        canvasRef.current.loadPaths(ink)

        customEditor?.commands.setContent(data.jsonData!)
    }, [canvasRef, customEditor, item, exportedData.rows])

    const displayedUsers = users.slice(0, 3)

    const providerValue = useMemo(() => {
        return {}
    }, [])

    React.useEffect(() => {
        const changeExistingStrokeColor = async () => {
            if (canvasRef.current) {
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

                // Update the current stroke color for new strokes
                // setStrokeColor(newColor);
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

    if (!customEditor) {
        return null
    }

    return (
        // <div className="flex h-full align-self self-start">
        <div className="flex flex-col relative w-auto h-full border-0 overflow-hidden">
            <EditorHeader
                characters={characterCount.characters()}
                // collabState={collabState}
                // users={displayedUsers}
                words={characterCount.words()}
                isSidebarOpen={open}
                toggleSidebar={collapsePanel}
                canvasRef={canvasRef.current}
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
                onChange={() => {
                    // Save function in here, handles all points.
                    if (canvasRef.current) {
                        debouncedInkSave(canvasRef.current)
                    }
                }}
                withTimestamp
            />
            <EditorContent
                editor={customEditor}
                ref={editorRef}
                className={editorClass}
            />
            <ContentItemMenu editor={customEditor!} />
            <LinkMenu editor={customEditor!} appendTo={menuContainerRef} />
            <TextMenu editor={customEditor!} />
            <ColumnsMenu editor={customEditor!} appendTo={menuContainerRef} />
            <TableRowMenu editor={customEditor!} appendTo={menuContainerRef} />
            <TableColumnMenu
                editor={customEditor!}
                appendTo={menuContainerRef}
            />
            <ImageBlockMenu
                editor={customEditor!}
                appendTo={menuContainerRef}
            />
        </div>
    )
}

export default BlockEditor
