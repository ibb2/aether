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

    const reactSketchCanvasClass = useMemo(
        () => cn('absolute', readOnly && 'z-[-1]'),
        [readOnly]
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
        <div className="flex flex-col absolute w-auto h-full border-0 overflow-hidden">
            <ReactSketchCanvas
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
})

BlockEditor.displayName = 'BlockEditor'

export default BlockEditor
