import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { TableOfContents } from "../TableOfContents";
import { NotebookDialog } from "../dialogs/notebook";
import { useEvolu, useQueries, useQuery } from "@evolu/react";
import { notebooksQuery, notesQuery } from "@/db/queries";
import { NoteDialog } from "../dialogs/note";
import { Button } from "../ui/Button";
import { Trash2 } from "lucide-react";
import type { Database } from "@/db/db";

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

    const [notebooks, notes] = useQueries([notebooksQuery, notesQuery]);

    console.log("Notebooks1: ", notebooks);

    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    }, [onClose]);

    const windowClassName = cn(
      "absolute top-0 left-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all",
      "dark:bg-black lg:dark:bg-black/30",
      !isOpen && "border-r-transparent",
      isOpen && "w-80 border-r border-r-neutral-200 dark:border-r-neutral-800",
    );

    const deleteNote = (noteId) => {
      update("notes", { id: noteId, isDeleted: true });
    };

    return (
      <div className={windowClassName}>
        <div className="w-full h-full overflow-hidden">
          <div className="w-full h-full p-6 overflow-auto">
            <NoteDialog />
            <NotebookDialog />
            <div className="p-6">
              {notebooks.rows.map((notebook) => (
                <>
                  <p className="pb-3">{notebook.title}</p>
                  {notes.rows.map((note) => (
                    <>
                      {note.notebookId === notebook.id && !note.isDeleted && (
                        <div className="grid grid-cols-2 py-2">
                          <p className="pl-10 ">{note.name}</p>
                          <Button
                            variant="destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </>
                  ))}
                </>
              ))}
            </div>
            {/* <TableOfContents onItemClick={handlePotentialClose} editor={editor} /> */}
          </div>
        </div>
      </div>
    );
  },
);

Sidebar.displayName = "TableOfContentSidepanel";
