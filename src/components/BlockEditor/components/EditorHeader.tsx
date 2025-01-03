import { Icon } from '@/components/ui/Icon'
import { EditorInfo } from './EditorInfo'
import { EditorUser } from '../types'
import { WebSocketStatus } from '@hocuspocus/provider'
import { Toolbar } from '@/components/ui/Toolbar'
import { ReactSketchCanvasRef } from 'react-sketch-canvas'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export type EditorHeaderProps = {
    isSidebarOpen?: boolean
    toggleSidebar?: any
    characters: number
    words: number
    // collabState: WebSocketStatus;
    // users: EditorUser[];
    canvasRef: ReactSketchCanvasRef | null
    readOnly: boolean
    setReadOnly: any
}

export const EditorHeader = ({
    characters,
    // collabState,
    // users,
    words,
    isSidebarOpen,
    toggleSidebar,
    canvasRef,
    readOnly,
    setReadOnly,
}: EditorHeaderProps) => {
    const {
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar: toggleSidebarProp,
    } = useSidebar()

    return (
        <header className="flex h-16 w-full shrink-0 items-center gap-2 z-10">
            <div className="flex w-full justify-between items-center gap-2 px-4">
                <div className="flex items-center">
                    <SidebarTrigger className="-ml-1" />
                </div>
                <EditorInfo
                    characters={characters}
                    words={words}
                    // collabState={collabState}
                    // users={users}
                    canvasRef={canvasRef}
                    readOnly={readOnly}
                    setReadOnly={setReadOnly}
                />
            </div>
        </header>
    )
}
