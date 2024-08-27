import * as S from "@effect/schema/Schema";
import { cn } from "@/lib/utils/index";
import {
  Book,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderClosed,
  FolderOpen,
  NotebookTabs,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { NonEmptyString50, NotebookId, NoteId, SectionId } from "@/db/schema";
import { Database, evolu } from "@/db/db";
import React from "react";
import {
  cast,
  NonEmptyString1000,
  String,
  useEvolu,
  useQueries,
  useQuery,
} from "@evolu/react";
import useNoteStore from "@/store/note";
import useStateStore from "@/store/state";
import { Button } from "../ui/Button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { initialContent } from "@/lib/data/initialContent";
import { ComboboxDemo } from "../dialogs/Combobox/sections";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { sectionsQuery } from "@/db/queries";

const FragmentNode = ({ node, style, dragHandle, tree }) => {
  /* This node instance can do many things. See the API reference. */
  // console.log("node ", node);
  //
  // State
  const [sectionDialog, onSectionDialog] = React.useState(false);
  const [noteDialog, onNoteDialog] = React.useState(false);
  const [sectionName, setSectionName] = React.useState("");
  const [noteName, setNoteName] = React.useState("");

  // References
  const inputRef = React.useRef(null);

  // Store
  const setNote = useNoteStore((state) => state.setNote);

  const { isInkEnabled, isPageSplit, setInkStatus, setPageSplit } =
    useNoteStore((state) => ({
      isInkEnabled: state.isInkEnabled,
      isPageSplit: state.isPageSplit,
      setInkStatus: state.setInkStatus,
      setPageSplit: state.setPageSplit,
    }));

  const { editor, canvasRef } = useStateStore((state) => ({
    editor: state.editor,
    canvasRef: state.canvasRef.current,
  }));

  // Evolu
  const exportedDataQuery = React.useCallback(
    () =>
      evolu.createQuery((db) =>
        db
          .selectFrom("exportedData")
          .select("id")
          .select("jsonData")
          .select("noteId")
          .select("inkData"),
      ),
    [],
  );
  const noteSettingsQuery = React.useCallback(
    () => evolu.createQuery((db) => db.selectFrom("noteSettings").selectAll()),
    [],
  );

  const [exportedDataRows, noteSettings, sections] = useQueries([
    exportedDataQuery(),
    noteSettingsQuery(),
    sectionsQuery,
  ]);

  const [selectedSection, setSelectedSection] = React.useState(node.id);

  const { create, update } = useEvolu<Database>();

  // Update selectNote to use the query results
  const selectNote = () => {
    const noteId = S.decodeSync(NoteId)(node.id);
    const exportedData = exportedDataRows.rows.find(
      (row) => row.noteId === noteId,
    );
    const noteSetting = noteSettings.rows.find((row) => row.noteId === noteId);
    console.log("JSON Data, ", exportedData?.jsonData);
    console.log("INK Data, ", exportedData?.inkData);

    if (exportedData) {
      setNote(
        exportedData.jsonData!,
        S.decodeSync(NonEmptyString50)(exportedData.noteId ?? ""),
        noteId,
        exportedData.id,
      );

      const ink = exportedData.inkData as unknown as CanvasPath[];

      if (canvasRef && exportedData.inkData) {
        canvasRef.resetCanvas();
        canvasRef.loadPaths(ink);
      }
      if (canvasRef && exportedData.inkData === null) {
        canvasRef.resetCanvas();
        // console.log("clear");
      }
      if (editor) editor.commands.setContent(exportedData.jsonData!);
    }
  };

  const deleteNode = () => {
    if (node.level !== 0) {
      if (node.data.type === "section") {
        update("sections", {
          id: S.decodeSync(SectionId)(node.id),
          isDeleted: true,
        });
      }
      if (node.data.type === "note") {
        update("notes", { id: S.decodeSync(NoteId)(node.id), isDeleted: true });
      }
    }
  };

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "node-container",
              "flex py-2 w-full justify-between rounded-md hover:bg-slate-100 dark:hover:bg-slate-900",
            )}
            style={style}
            ref={dragHandle}
            onClick={() => {
              selectNote();
            }}
          >
            <p className={cn("node-content", "flex gap-x-2 items-center")}>
              <div className="flex">
                <File />
              </div>
              <p className={cn("node-text")}>
                {node.isEditing ? (
                  <input
                    type="text"
                    defaultValue={node.data.title}
                    onFocus={(e) => e.currentTarget.select()}
                    onBlur={() => node.reset()}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") node.reset();
                      if (e.key === "Enter") node.submit(e.currentTarget.value);
                    }}
                    autoFocus
                  />
                ) : (
                  <p>{node.data.title}</p>
                )}
              </p>
            </p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <DialogTrigger asChild>
            <ContextMenuItem
              onSelect={(e) => {
                deleteNode();
                e.preventDefault();
              }}
            >
              <span>Delete</span>
            </ContextMenuItem>
          </DialogTrigger>
        </ContextMenuContent>
      </ContextMenu>
    </Dialog>
  );
};

export default FragmentNode;
