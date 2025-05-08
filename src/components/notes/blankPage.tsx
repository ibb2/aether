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

const BlankPage = forwardRef((canvasRef) => {
    // States for React Sketch Canvas
    const [readOnly, setReadOnly] = React.useState(false)

    // State for Themes
    const { theme } = useTheme()

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
                ref={canvasRef?.current}
                readOnly={readOnly}
                height="92.5%"
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
        </div>
    )
})

BlankPage.displayName = 'BlockEditor'

export default BlankPage
