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
import { evolu } from "@/db/db";
import React from "react";
import { useQuery } from "@evolu/react";
import useNoteStore from "@/store/note";
import useStateStore from "@/store/state";
import { Button } from "../ui/Button";

const Node = ({ node, style, dragHandle, tree }) => {
  /* This node instance can do many things. See the API reference. */

  // Store
  const setNote = useNoteStore((state) => state.setNote);

  const { editor, canvasRef } = useStateStore((state) => ({
    editor: state.editor,
    canvasRef: state.canvasRef.current,
  }));

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
      console.log("ink ", ink);
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
  return (
    <div
      className={cn(
        "node-container",
        "flex justify-between mt-14 hover:bg-zinc-100",
      )}
      style={style}
      ref={dragHandle}
      onClick={() => {
        if (node.isLeaf) selectNote();
      }}
    >
      <Button
        variant="ghost"
        className={cn(
          "node-content",
          "flex gap-x-2 items-center",
          node.level > 0 && "ml-6",
        )}
        onClick={() => node.isInternal && node.toggle()}
      >
        <div className="flex">
          {!node.isLeaf && node.level === 0 && (
            <>
              {node.isOpen ? <ChevronDown /> : <ChevronRight />}
              <NotebookTabs />
            </>
          )}
          {node.isLeaf && node.level > 0 && <File />}
          {!node.isLeaf && node.level > 0 && (
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
      </Button>
      <div className={cn("file-actions", "invisible hover:visible")}>
        <div className={cn("folderFileActions")}>
          <button onClick={() => node.edit()} title="Rename...">
            <Pencil />
          </button>
          <button onClick={() => tree.delete(node.id)} title="Delete">
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Node;
