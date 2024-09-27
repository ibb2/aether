import { Icon } from "@/components/ui/Icon";
import { EditorInfo } from "./EditorInfo";
import { EditorUser } from "../types";
import { WebSocketStatus } from "@hocuspocus/provider";
import { Toolbar } from "@/components/ui/Toolbar";
import { ReactSketchCanvasRef } from "react-sketch-canvas";

export type EditorHeaderProps = {
  isSidebarOpen?: boolean;
  toggleSidebar?: any;
  characters: number;
  words: number;
  // collabState: WebSocketStatus;
  // users: EditorUser[];
  canvasRef: ReactSketchCanvasRef | null;
  readOnly: boolean;
  setReadOnly: any;
};

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
  return (
    <div className="grid grid-flow-col auto-cols-auto flex-none py-2 pl-6 pr-3 text-black bg-white border-neutral-200 dark:bg-inherit dark:text-white dark:border-neutral-800 z-10">
      <div className="items-center">
        <div className="flex items-center gap-x-1.5">
          <Toolbar.Button
            tooltip={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => {
              toggleSidebar();
              console.log("is the sidebar open", isSidebarOpen);
            }}
            // active={isSidebarOpen}
            className={isSidebarOpen ? "bg-transparent" : ""}
          >
            <Icon name={isSidebarOpen ? "PanelRightOpen" : "PanelLeftOpen"} />
          </Toolbar.Button>
        </div>
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
  );
};
