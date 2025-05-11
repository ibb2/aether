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
import { Layer, Line, Shape, Stage } from 'react-konva'
import { getStroke } from 'perfect-freehand'
import getSvgPathFromStroke from '@/lib/utils/getSvgPathFromStroke'
import useMeasure from 'react-use-measure'
import { currentUser } from '@clerk/nextjs/server'
import { useDrawingStore } from '@/store/drawingStore'

const BlankPage = forwardRef((item, canvasRef) => {
    // States for React Sketch Canvas
    const [readOnly, setReadOnly] = React.useState(false)

    // Evolu
    const { update } = useEvolu<Database>()

    // State for Themes
    const { theme, resolvedTheme } = useTheme()

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

    function getInkColor(
        theme: string | undefined,
        resolvedTheme: string | undefined
    ): string {
        if (theme === 'light') {
            return 'black'
        } else if (theme === 'dark') {
            return 'white'
        } else if (theme === 'system') {
            return resolvedTheme === 'light' ? 'black' : 'white'
        }
        return 'black' // fallback
    }

    // Debounced effect to change stroke color based on theme
    const debouncedChangeExistingStrokeColor = useDebouncedCallback(
        async () => {
            if (canvasRef?.current) {
                console.log(getInkColor(theme, resolvedTheme))
                // Get current paths
                const paths = await canvasRef.current.exportPaths()
                // Modify the color of all paths
                const updatedPaths = paths.map((path) => ({
                    ...path,
                    strokeColor: getInkColor(theme, resolvedTheme),
                }))

                // Clear the canvas
                await canvasRef.current.clearCanvas()

                // Load the modified paths
                await canvasRef.current.loadPaths(updatedPaths)
            }
        },
        200
    )

    React.useEffect(() => {
        console.log('Theme: ', theme, resolvedTheme)
        debouncedChangeExistingStrokeColor()
        // Cleanup on unmount
        return () => {
            debouncedChangeExistingStrokeColor.cancel()
        }
    }, [theme, resolvedTheme, debouncedChangeExistingStrokeColor])

    const reactSketchCanvasClass = React.useMemo(
        () =>
            cn(
                'absolute',
                'mx-auto h-auto w-full aspect-[210/297] block',
                readOnly && 'z-[-1]'
            ),
        [readOnly]
    )

    const canvasStyle = React.useMemo(() => ({ border: 0 }), [])

    // Custom React canvas
    const [ref, bounds] = useMeasure()

    const [shadowStrokes, setShadowStrokes] = React.useState<any>([])

    const {
        isDrawing,
        strokes,
        currentStroke,
        setIsDrawing,
        setCurrentStroke,
        setStrokes,
        push,
    } = useDrawingStore()

    const [strokeColor, setStrokeColor] = React.useState('#000')

    function getInkColour(
        theme: string | undefined,
        resolvedTheme: string | undefined
    ): string {
        if (theme === 'light') {
            return 'black'
        } else if (theme === 'dark') {
            return 'white'
        } else if (theme === 'system') {
            return resolvedTheme === 'light' ? 'black' : 'white'
        }
        return 'black' // fallback
    }

    const saveInkData = React.useCallback(async () => {
        console.log('Saved')
        if (item === null) return
        console.log('Item: ', item)
        if (exportedId === null) return

        update('exportedData', {
            id: exportedId,
            inkData: strokes,
        })
    }, [item, exportedId, update, strokes])

    const debouncedInkSave = useDebouncedCallback(saveInkData, 500)

    React.useLayoutEffect(() => {
        if (type !== 'Blank') return
        console.log(1)
        const data = exportedData.rows.find((ed) => ed.id === exportedId)
        console.log(2)
        if (data === undefined || data.inkData === null) return
        console.log(3)
        const s = data.inkData
        console.log(s)
        setStrokes(s)
    }, [exportedId, type])

    React.useEffect(() => {
        setStrokeColor(getInkColour(theme, resolvedTheme))
    }, [theme, resolvedTheme])

    const handlePointerDown = (e) => {
        setIsDrawing(true)
        const stage = e.target.getStage()
        const point = stage.getPointerPosition()
        const pressure = e.evt.pressure || 0.5
        setCurrentStroke([[point.x, point.y, pressure]])
    }

    const handlePointerMove = (e) => {
        if (!isDrawing) return
        const stage = e.target.getStage()
        const point = stage.getPointerPosition()
        const pressure = e.evt.pressure || 0.5
        setCurrentStroke([...currentStroke, [point.x, point.y, pressure]])
        // Trigger a re-render
        setShadowStrokes([...shadowStrokes])
    }

    const handlePointerUp = () => {
        setIsDrawing(false)
        setStrokes([...strokes, currentStroke])
        setShadowStrokes([...shadowStrokes, currentStroke])

        push(currentStroke)

        setCurrentStroke([])

        debouncedInkSave()
    }

    const renderStroke = (points) => {
        const stroke = getStroke(points, {
            size: 8,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        })
        const pathData = getSvgPathFromStroke(stroke)
        return (
            <Line
                sceneFunc={(context, shape) => {
                    context.beginPath()
                    const path = new Path2D(pathData)
                    context.fillStyle = strokeColor
                    context.fill(path)
                    context.fillStrokeShape(shape)
                }}
                strokeWidth={2}
            />
        )
    }

    return (
        <div ref={ref} className="flex w-full h-auto aspect-[210/297]">
            <Stage
                className="overflow-hidden border-2 border-green-300"
                width={1000}
                height={2000}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <Layer>
                    {strokes.map((strokePoints, i) => (
                        <>{renderStroke(strokePoints)}</>
                    ))}
                    {isDrawing && renderStroke(currentStroke)}
                </Layer>
            </Stage>
        </div>
    )
})

BlankPage.displayName = 'BlockEditor'

export default BlankPage
