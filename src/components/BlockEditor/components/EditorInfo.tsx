import React from 'react'

import { memo } from 'react'
import {
    DropdownMenuCheckboxItemProps,
    DropdownMenuGroup,
    DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    ArrowLeftFromLine,
    ArrowRightToLine,
    Eraser,
    Pen,
    Redo,
    RefreshCcw,
    Settings,
    Settings2,
    ToggleLeft,
    ToggleRight,
    Trash,
    Undo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReactSketchCanvasRef } from 'react-sketch-canvas'
import useNoteStore from '@/store/note'
import { cn } from '@/lib/utils'

type Checked = DropdownMenuCheckboxItemProps['checked']

export type EditorInfoProps = {
    characters?: number
    words?: number
    // collabState: WebSocketStatus;
    // users: EditorUser[];
    canvasRef: ReactSketchCanvasRef | null
    readOnly: boolean
    setReadOnly: any
}

export const EditorInfo = memo(
    ({
        characters = 0,
        words = 0,
        canvasRef,
        readOnly,
        setReadOnly,
    }: EditorInfoProps) => {
        const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true)
        const [showActivityBar, setShowActivityBar] =
            React.useState<Checked>(false)
        const [showPanel, setShowPanel] = React.useState<Checked>(false)
        const [session, setSession] = React.useState<any>(null)
        const [open, onOpen] = React.useState(false)
        const [animate, onAnimate] = React.useState(false)

        const isInkEnabled = useNoteStore((state) => state.isInkEnabled)
        const toggleInking = useNoteStore((state) => state.setInkStatus)

        // const noteSettingsQuery = React.useCallback(
        //   () => evolu.createQuery((db) => db.selectFrom("noteSettings").selectAll()),
        //   [],
        // );

        // const [noteSettings] = useQueries([
        //   noteSettingsQuery(),
        // ])

        // const disableInkForNote = () => {
        //   const noteSetting = noteSettings.rows.find((row) => row.noteId === noteId);
        // }

        const openSettings = () => {
            onAnimate(true)
            setTimeout(() => {
                onAnimate(false)
            }, 1000)
        }

        const [eraseMode, setEraseMode] = React.useState(false)

        const handleEraserClick = () => {
            setEraseMode(true)
            if (canvasRef) canvasRef.eraseMode(true)
        }

        const handlePenClick = () => {
            setEraseMode(false)
            if (canvasRef) canvasRef.eraseMode(false)
        }

        const handleUndoClick = () => {
            if (canvasRef) canvasRef.undo()
        }

        const handleRedoClick = () => {
            if (canvasRef) canvasRef.redo()
        }

        const handleClearClick = () => {
            if (canvasRef) canvasRef.clearCanvas()
        }

        const handleResetClick = () => {
            if (canvasRef) canvasRef.resetCanvas()
        }

        const handleDisableCanvas = () => {
            if (canvasRef) {
                toggleInking()
                // setReadOnly(!isInkEnabled);
            }
        }

        React.useEffect(() => {
            setReadOnly(!isInkEnabled)
        }, [isInkEnabled, setReadOnly])

        const customClass = cn(
            'flex z-10',
            open && 'justify-between',
            !open && 'justify-end'
        )

        return (
            <div className={customClass}>
                {/* <div className="flex flex-col justify-center pr-4 mr-4 text-right border-r border-neutral-200 dark:border-neutral-800">
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {words} {words === 1 ? "word" : "words"}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {characters} {characters === 1 ? "character" : "characters"}
          </div>
        </div> */}
                {/* <div className="flex items-center gap-2 mr-2">
        <div
          className={cn("w-2 h-2 rounded-full", {
            "bg-yellow-500 dark:bg-yellow-400": collabState === "connecting",
            "bg-green-500 dark:bg-green-400": collabState === "connected",
            "bg-red-500 dark:bg-red-400": collabState === "disconnected",
          })}
        />
        <span className="max-w-[4rem] text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
          {getConnectionText(collabState)}
        </span>
      </div>
      {collabState === "connected" && (
        <div className="flex flex-row items-center">
          <div className="relative flex flex-row items-center ml-3">
            {users.map((user: EditorUser) => (
              <div key={user.clientId} className="-ml-3">
                <Tooltip title={user.name}>
                  <img
                    className="w-8 h-8 border border-white rounded-full dark:border-black"
                    src={`https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${
                      user.name
                    }&backgroundColor=${user.color.replace("#", "")}`}
                    alt="avatar"
                  />
                </Tooltip>
              </div>
            ))}
            {users.length > 3 && (
              <div className="-ml-3">
                <div className="flex items-center justify-center w-8 h-8 font-bold text-xs leading-none border border-white dark:border-black bg-[#FFA2A2] rounded-full">
                  +{users.length - 3}
                </div>
              </div>
            )}
          </div>
        </div>
      )} */}

                {open && (
                    <div className="flex flex-row gap-2 justify-between pr-4 mr-4 text-right duration-300 transition-all">
                        {/* <div className="d-flex gap-2 align-items-center "> */}
                        <Button
                            variant={eraseMode ? 'outline' : 'default'}
                            size="sm"
                            onClick={handlePenClick}
                        >
                            <Pen />
                        </Button>
                        <Button
                            variant={!eraseMode ? 'outline' : 'default'}
                            size="sm"
                            onClick={handleEraserClick}
                        >
                            <Eraser />
                        </Button>
                        <div className="vr" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUndoClick}
                        >
                            <Undo />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRedoClick}
                        >
                            <Redo />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearClick}
                        >
                            <Trash />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetClick}
                        >
                            <RefreshCcw />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleDisableCanvas}
                            size="sm"
                            className="mr-2"
                        >
                            {isInkEnabled ? <ToggleRight /> : <ToggleLeft />}
                        </Button>
                    </div>
                )}
                <div className="flex flex-row justify-self-end">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpen(!open)}
                    >
                        {open ? <ArrowRightToLine /> : <ArrowLeftFromLine />}
                    </Button>
                    <div className="flex">
                        <div className="relative flex flex-row items-center ml-3 ">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar> */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openSettings()}
                                        className={cn(
                                            animate && 'animate-spin'
                                        )}
                                    >
                                        <Settings2 />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="p-2">
                                    <DropdownMenuLabel>
                                        Page Settings
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleDisableCanvas}
                                        className="flex items-center justify-between px-2"
                                    >
                                        Ink
                                        {isInkEnabled ? (
                                            <ToggleRight />
                                        ) : (
                                            <ToggleLeft />
                                        )}
                                    </DropdownMenuItem>
                                    {/* <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <LogIn className="mr-2 h-4 w-4" />
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <LogIn className="mr-2 h-4 w-4" />
                      <Link href="/signup">Sign up</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup> */}
                                    <DropdownMenuGroup>
                                        {/* <DropdownMenuItem className="flex items-center px-1.5 py-0.5 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem> */}
                                        <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <Link href="/settings">
                                                <span>Settings</span>
                                            </Link>
                                            <DropdownMenuShortcut>
                                                ⌘S
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                        {/* <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <Keyboard className="mr-2 h-4 w-4" />
                      <span>Keyboard shortcuts</span>
                      <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem> */}
                                    </DropdownMenuGroup>
                                    {/* <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Team</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center px-1.5 py-0.5">
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Invite users</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="mr-3 p-2">
                          <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Email</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Message</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>More...</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Team</span>
                      <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                    <Github className="mr-2 h-4 w-4" />
                    <span>GitHub</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center px-1.5 py-0.5"
                    disabled
                  >
                    <Cloud className="mr-2 h-4 w-4" />
                    <span>API</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator /> */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

EditorInfo.displayName = 'EditorInfo'
