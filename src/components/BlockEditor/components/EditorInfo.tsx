import React from "react";

import { WebSocketStatus } from "@hocuspocus/provider";
import { memo } from "react";
import { EditorUser } from "../types";
import { cn } from "../../../lib/utils";
import { getConnectionText } from "../../../lib/utils/getConnectionText";
import Tooltip from "../../ui/Tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuCheckboxItemProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Cloud,
  CreditCard,
  Eraser,
  Github,
  Keyboard,
  LifeBuoy,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Pen,
  Plus,
  PlusCircle,
  Redo,
  RefreshCcw,
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash,
  Undo,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { lucia } from "@/lib/auth";
import { validateRequest } from "@/lib/auth/validateRequests";
import { getUser } from "@/actions/auth/validate";
import { logout } from "@/actions/auth/logout";
import { ReactSketchCanvasRef } from "react-sketch-canvas";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export type EditorInfoProps = {
  characters: number;
  words: number;
  // collabState: WebSocketStatus;
  // users: EditorUser[];
  canvasRef: ReactSketchCanvasRef | null;
  readOnly: boolean;
  setReadOnly: any;
};

export const EditorInfo = memo(
  ({
    characters,
    words,
    canvasRef,
    readOnly,
    setReadOnly,
  }: EditorInfoProps) => {
    const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
    const [showActivityBar, setShowActivityBar] =
      React.useState<Checked>(false);
    const [showPanel, setShowPanel] = React.useState<Checked>(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [session, setSession] = React.useState<any>(null);
    const [open, onOpen] = React.useState(false);

    const [eraseMode, setEraseMode] = React.useState(false);

    const handleEraserClick = () => {
      setEraseMode(true);
      if (canvasRef) canvasRef.eraseMode(true);
    };

    const handlePenClick = () => {
      setEraseMode(false);
      if (canvasRef) canvasRef.eraseMode(false);
    };

    const handleUndoClick = () => {
      if (canvasRef) canvasRef.undo();
    };

    const handleRedoClick = () => {
      if (canvasRef) canvasRef.redo();
    };

    const handleClearClick = () => {
      if (canvasRef) canvasRef.clearCanvas();
    };

    const handleResetClick = () => {
      if (canvasRef) canvasRef.resetCanvas();
    };

    const handleDisableCanvas = () => {
      if (canvasRef) {
        setReadOnly(!readOnly);
      }
    };

    React.useEffect(() => {
      async function setLoginState() {
        const { user, session } = await getUser();

        if (user !== null) {
          setIsLoggedIn(true);
          setSession(session);
        } else {
          setIsLoggedIn(false);
          setSession(null);
        }
      }

      setLoginState();
    }, [isLoggedIn, session]);

    const customClass = cn(
      "flex z-10",
      open && "justify-between",
      !open && "justify-end",
    );

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

        {/* {isLoggedIn && (
          <div className="flex">
            <div className="relative flex flex-row items-center ml-3 ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <Keyboard className="mr-2 h-4 w-4" />
                      <span>Keyboard shortcuts</span>
                      <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center px-1.5 py-0.5"
                    onClick={() => {
                      logout(session);
                      setSession(null);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        {!isLoggedIn && (
          <div>
            <Link href="/login" className="mr-2">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        )} */}
        {open && (
          <div className="flex flex-row gap-2 justify-between pr-4 mr-4 text-right duration-300 transition-all">
            {/* <div className="d-flex gap-2 align-items-center "> */}
            <Button
              variant={eraseMode ? "outline" : "default"}
              size="icon"
              onClick={handlePenClick}
            >
              <Pen />
            </Button>
            <Button
              variant={!eraseMode ? "outline" : "default"}
              size="icon"
              onClick={handleEraserClick}
            >
              <Eraser />
            </Button>
            <div className="vr" />
            <Button variant="outline" size="icon" onClick={handleUndoClick}>
              <Undo />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRedoClick}>
              <Redo />
            </Button>
            <Button variant="outline" size="icon" onClick={handleClearClick}>
              <Trash />
            </Button>
            <Button variant="outline" size="icon" onClick={handleResetClick}>
              <RefreshCcw />
            </Button>
            <Button
              variant="ghost"
              onClick={handleDisableCanvas}
              size="icon"
              className="mr-2"
            >
              {readOnly ? <ToggleRight /> : <ToggleLeft />}
            </Button>
          </div>
        )}
        <div className="flex flex-row justify-self-end">
          <Button size="icon" variant="outline" onClick={() => onOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
          <div className="flex">
            <div className="relative flex flex-row items-center ml-3 ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <LogIn className="mr-2 h-4 w-4" />
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <LogIn className="mr-2 h-4 w-4" />
                      <Link href="/signup">Sign up</Link>
                    </DropdownMenuItem> */}
                  </DropdownMenuGroup>
                  <DropdownMenuGroup>
                    {/* <DropdownMenuItem className="flex items-center px-1.5 py-0.5 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem className="flex items-center px-1.5 py-0.5">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
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
                  {isLoggedIn && (
                    <DropdownMenuItem
                      className="flex items-center px-1.5 py-0.5"
                      onClick={() => {
                        logout(session);
                        setSession(null);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

EditorInfo.displayName = "EditorInfo";
