import * as S from "@effect/schema/Schema";
import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { TableOfContents } from "../TableOfContents";
import { NotebookDialog } from "../dialogs/notebook";
import { useEvolu, useQueries, useQuery, String } from "@evolu/react";
import { notebooksQuery, notesQuery } from "@/db/queries";
import { NoteDialog } from "../dialogs/note";
import { Button } from "../ui/Button";
import { Trash2 } from "lucide-react";
import { evolu, type Database } from "@/db/db";
import useNoteStore from "@/store/note";
import { Brand } from "effect/Brand";
import { NonEmptyString50, NoteId } from "@/db/schema";
import React from "react";
import Link from "next/link";
import TreeMenu from "../Recursive/TreeMenu";

export const Sidebar = memo(
  ({
    editor,
    isOpen,
    onClose,
  }: {
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
  }) => {
    const { update } = useEvolu<Database>();

    // NoteStore zustand
    const { name, data, setNote } = useNoteStore((state) => ({
      name: state.name,
      data: state.data,
      setNote: state.setNote,
    }));

    const [notebooks, notes] = useQueries([notebooksQuery, notesQuery]);

    // Move the exportedDataQuery outside of selectNote
    const exportedDataQuery = evolu.createQuery((db) =>
      db
        .selectFrom("exportedData")
        .select("id")
        .select("jsonData")
        .select("noteId"),
    );

    // Use the query result here
    const { rows: exportedDataRows } = useQuery(exportedDataQuery);

    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    }, [onClose]);

    const windowClassName = cn(
      "absolute top-0 left-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full z-[999] w-0 duration-300 transition-all",
      "dark:bg-black lg:dark:bg-black/30",
      !isOpen && "border-r-transparent",
      isOpen && "w-80 border-r border-r-neutral-200 dark:border-r-neutral-800",
    );

    const deleteNote = (noteId: string & Brand<"Id"> & Brand<"Note">) => {
      update("notes", { id: noteId, isDeleted: true });
    };

    // Update selectNote to use the query results
    const selectNote = (noteId: string & Brand<"Id"> & Brand<"Note">) => {
      const exportedData = exportedDataRows.find(
        (row) => row.noteId === noteId,
      );
      console.log("JSON Data, ", exportedData?.jsonData);
      if (exportedData) {
        setNote(
          exportedData.jsonData!,
          S.decodeSync(NonEmptyString50)(exportedData.noteId ?? ""),
          noteId,
          exportedData.id,
        );
        editor.commands.setContent(exportedData.jsonData!);
      }
    };

    return (
      <div className={windowClassName}>
        <div className="w-full h-full overflow-hidden">
          <div className="w-full h-full p-6 overflow-auto">
            <div className="flex h-14 items-center border-b px-4 lg:px-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold pb-3"
              >
                {/* <Package2 className="h-6 w-6" /> */}
                <span className="">Aether notes</span>
              </Link>
              {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button> */}
            </div>

            <div className="flex flex-col max-w-min justify-center">
              <NoteDialog />
              <NotebookDialog />
            </div>

            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {notebooks.rows.map((notebook) => (
                  <Link
                    href="#"
                    className="items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    key={notebook.id}
                  >
                    {/* <Home className="h-4 w-4" /> */}
                    {notebook.title}
                    <TreeMenu data={notes} id={notebook.id} />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Sidebar.displayName = "TableOfContentSidepanel";
