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
import { NonEmptyString50, NoteId } from "@/db/schema";
import { Database, evolu } from "@/db/db";
import React from "react";
import { useEvolu, useQuery } from "@evolu/react";
import useNoteStore from "@/store/note";
import useStateStore from "@/store/state";
import { Button } from "../ui/Button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
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

const Node = ({ node, style, dragHandle, tree }) => {
  /* This node instance can do many things. See the API reference. */
  // console.log("node ", node);
  //
  // State
  const [sectionDialog, onSectionDialog] = React.useState(false);
  const [noteDialog, onNoteDialog] = React.useState(false);
  const [sectionName, setSectionName] = React.useState("");
  const [noteName, setNoteName] = React.useState("");

  // Store
  const setNote = useNoteStore((state) => state.setNote);

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

  const { rows: exportedDataRows } = useQuery(exportedDataQuery());

  const { create } = useEvolu<Database>();

  // console.log(node.is)
  // Update selectNote to use the query results
  const selectNote = () => {
    const noteId = S.decodeSync(NoteId)(node.id);
    const exportedData = exportedDataRows.find((row) => row.noteId === noteId);
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

  const newSectionFromSection = () => {
    // For creating sections

    const { id: sectionId } = create("sections", {
      title: S.decodeSync(NonEmptyString1000)(sectionName),
      notebookId: selectedNotebook,
    });

    console.log("Section ", selectedNotebook);
  };
  const newNoteFromSection = () => {
    // For creating sections

    const { id: sectionId } = create("sections", {
      title: S.decodeSync(NonEmptyString1000)(sectionName),
      notebookId: selectedNotebook,
    });

    console.log("Section ", selectedNotebook);
  };

  const newSectionFromNotebook = () => {
    const { id: noteId } = create("notes", {
      title: S.decodeSync(NonEmptyString1000)(noteName),
      notebookId: selectedNotebook,
    });

    const { id: exportedDataId } = create("exportedData", {
      noteId,
      jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${noteId}`),
      jsonData: initialContent,
    });
  };

  const newNoteFromNotebook = () => {
    const { id: noteId } = create("notes", {
      title: S.decodeSync(NonEmptyString1000)(noteName),
      notebookId: selectedNotebook,
    });

    const { id: exportedDataId } = create("exportedData", {
      noteId,
      jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${noteId}`),
      jsonData: initialContent,
    });
  };

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "node-container",
              "flex py-2 w-full justify-between rounded-md hover:bg-zinc-100",
            )}
            style={style}
            ref={dragHandle}
            onClick={() => {
              if (node.isLeaf && !(node.data.type === "section")) {
                selectNote();
              } else {
                node.isInternal && node.toggle();
              }
            }}
          >
            <p
              className={cn(
                "node-content",
                "flex gap-x-2 items-center",
                // node.level > 0 && "ml-6",
              )}
              // onClick={() => node.isInternal && node.toggle()}
            >
              <div className="flex">
                {!node.isLeaf && node.level === 0 && (
                  <>
                    <NotebookTabs />
                  </>
                )}
                {node.data.type === "note" && <File />}
                {node.data.type === "section" && (
                  <>{node.isOpen ? <FolderOpen /> : <FolderClosed />}</>
                )}
              </div>
              <p className={cn("node-text")}>
                {node.isEditing ? (
                  <input
                    type="text"
                    defaultValue={node.data.name}
                    onFocus={(e) => e.currentTarget.select()}
                    onBlur={() => node.reset()}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") node.reset();
                      if (e.key === "Enter") node.submit(e.currentTarget.value);
                    }}
                    autoFocus
                  />
                ) : (
                  <p>{node.data.name}</p>
                )}
              </p>
            </p>
            {!node.isLeaf && node.level === 0 && (
              <div className={cn("file-actions")}>
                <div className={cn("folderFileActions")}>
                  {node.isOpen ? <ChevronDown /> : <ChevronRight />}
                  {/* <button onClick={() => node.edit()} title="Rename...">
              <Pencil />
            </button>
            <button onClick={() => tree.delete(node.id)} title="Delete">
              <X />
            </button> */}
                </div>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <DialogTrigger asChild>
            <ContextMenuItem
              onSelect={(e) => {
                onNoteDialog(false);
                onSectionDialog(true);
                e.preventDefault();
              }}
            >
              <span>New Section</span>
            </ContextMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <ContextMenuItem
              onSelect={(e) => {
                onSectionDialog(false);
                onNoteDialog(true);
                e.preventDefault();
              }}
            >
              <span>New Note</span>
            </ContextMenuItem>
          </DialogTrigger>
        </ContextMenuContent>
        {sectionDialog && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Section</DialogTitle>
              <DialogDescription>
                Organise your toughts and ideas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                placeholder="new section"
                onChange={(e) => setSectionName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="submit"
                  // onClick={notebookDialogHandler}
                >
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
        {noteDialog && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New note</DialogTitle>
              <DialogDescription>A clean slate.</DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5 pt-2.5">
              <div className="py-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="new note"
                  // onChange={(e) => setNoteName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="submit"
                  // onClick={notebookDialog2Handler}
                >
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </ContextMenu>
    </Dialog>
  );
};

export default Node;
