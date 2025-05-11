import { Icon } from '@/components/ui/Icon'
import { EditorInfo } from './EditorInfo'
import { EditorUser } from '../types'
import { WebSocketStatus } from '@hocuspocus/provider'
import { Toolbar } from '@/components/ui/Toolbar'
import { ReactSketchCanvasRef } from 'react-sketch-canvas'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { RefObject } from 'react'

export type EditorHeaderProps = {
    canvasRef: RefObject<ReactSketchCanvasRef> | null
    readOnly: boolean
    setReadOnly: any
}

export const EditorHeader = ({
    canvasRef,
    readOnly,
    setReadOnly,
}: EditorHeaderProps) => {
    return (
        <header className="flex sticky top-0 h-16 w-full items-center z-10">
            <EditorInfo
                canvasRef={canvasRef?.current}
                readOnly={readOnly}
                setReadOnly={setReadOnly}
            />
        </header>
    )
}
