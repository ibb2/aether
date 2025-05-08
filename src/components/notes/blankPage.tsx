import * as S from '@effect/schema/Schema'

import { Icon } from '@/components/ui/Icon'
import { WebSocketStatus } from '@hocuspocus/provider'
import { Toolbar } from '@/components/ui/Toolbar'
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import React, { forwardRef, RefObject } from 'react'
import { EditorInfo } from '../BlockEditor/components/EditorInfo'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from 'use-debounce'
import { useTheme } from 'next-themes'
import { convertCanvasPathsForDatabase } from '@/lib/utils/convertCanvasPaths'
import { useEvolu, useQuery } from '@evolu/react'
import { Database, evolu } from '@/db/db'
import { CanvasPathArray, ExportedDataId, NoteId } from '@/db/schema'
import path from 'node:path/posix'
import useNoteStore from '@/store/note'

const BlankPage = forwardRef((item, canvasRef) => {
    // States for React Sketch Canvas
    const [readOnly, setReadOnly] = React.useState(false)

    // Evolu
    const { update } = useEvolu<Database>()

    // State for Themes
    const { theme } = useTheme()

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

    const { itemstore, exportedId, noteId, type } = useNoteStore((state) => ({
        itemstore: state.item,
        exportedId: state.id,
        noteId: state.noteId,
        type: state.type,
    }))

    const saveInkData = React.useCallback(
        async (canvasRef: ReactSketchCanvasRef) => {
            if (item === null) return

            if (exportedId === null || canvasRef === null) return

            const time = await canvasRef?.getSketchingTime()
            const paths = await canvasRef?.exportPaths()

            const cleanedData = convertCanvasPathsForDatabase(paths)

            update('exportedData', {
                id: exportedId,
                inkData: S.decodeSync(CanvasPathArray)(cleanedData),
            })
        },
        [item, exportedData.rows, update]
    )
    const debouncedInkSave = useDebouncedCallback(saveInkData, 500)

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

    React.useEffect(() => {
        debouncedChangeExistingStrokeColor()
        // Cleanup on unmount
        return () => {
            debouncedChangeExistingStrokeColor.cancel()
        }
    }, [theme, debouncedChangeExistingStrokeColor])

    const reactSketchCanvasClass = React.useMemo(
        () => cn('absolute', readOnly && 'z-[-1]'),
        [readOnly]
    )

    const strokeColor = React.useMemo(
        () => (theme === 'light' ? 'black' : 'white'),
        [theme]
    )

    const canvasStyle = React.useMemo(() => ({ border: 0 }), [])

    return (
        <div className="flex w-full">
            <ReactSketchCanvas
                ref={canvasRef}
                readOnly={readOnly}
                height="92.5%"
                style={canvasStyle}
                canvasColor="transparent"
                strokeColor={strokeColor}
                className={reactSketchCanvasClass}
                onChange={() => {
                    if (canvasRef?.current) {
                        debouncedInkSave(canvasRef?.current)
                    }
                }}
                withTimestamp
            />
        </div>
    )
})

BlankPage.displayName = 'BlockEditor'

export default BlankPage
