import * as S from "@effect/schema/Schema";
import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { TableOfContents } from "../TableOfContents";
import { NotebookDialog } from "../dialogs/notebook";
import { useEvolu, useQueries, useQuery, String } from "@evolu/react";
import { notebooksQuery, notesQuery, sectionsQuery } from "@/db/queries";
import { NoteDialog } from "../dialogs/note";
import { Button } from "../ui/Button";
import { Plus, Trash2 } from "lucide-react";
import { evolu, type Database } from "@/db/db";
import useNoteStore from "@/store/note";
import { Brand } from "effect/Brand";
import { NonEmptyString50, NoteId } from "@/db/schema";
import React from "react";
import Link from "next/link";
import TreeMenu from "../Recursive/TreeMenu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SectionDialog } from "../dialogs/section";

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

    // Zustand stores
    const { name, data, setNote } = useNoteStore((state) => ({
      name: state.name,
      data: state.data,
      setNote: state.setNote,
    }));

    const [notebooks, sections, notes] = useQueries([
      notebooksQuery,
      sectionsQuery,
      notesQuery,
    ]);

    // State
    const [treeData, setTreeData] = React.useState<any>([]);

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

    // Make treeview data

    React.useEffect(() => {
      const fetchData = async () => {
        // const [notebooks, sections, notes] = await Promise.all([
        //   fetchNotebooks(),
        //   fetchSections(),
        //   fetchNotes(),
        // ]);
        const transformedData = transformData(notebooks, sections, notes);
        setTreeData(transformedData);
      };

      fetchData();
    }, []);

    const transformData = (notebooks, sections, notes) => {
      const sectionMap = new Map();
      sections.rows.forEach((section) => {
        sectionMap.set(section.id, { ...section, sections: [], notes: [] });
      });

      notes.rows.forEach((note) => {
        const section = sectionMap.get(note.sectionId);
        if (section) {
          section.notes.push(note);
        }
      });

      sections.rows.forEach((section) => {
        if (section.parentSectionId) {
          const parentSection = sectionMap.get(section.parentSectionId);
          if (parentSection) {
            parentSection.sections.push(sectionMap.get(section.id));
          }
        }
      });

      return notebooks.rows.map((notebook) => ({
        ...notebook,
        sections: sections.rows
          .filter(
            (section) =>
              section.notebookId === notebook.id && !section.parentSectionId,
          )
          .map((section) => sectionMap.get(section.id)),
        notes: notes.rows.filter(
          (note) => note.notebookId === notebook.id && !note.sectionId,
        ),
      }));
    };

    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    }, [onClose]);

    const windowClassName = cn(
      "bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full w-0 duration-300 transition-all",
      "dark:bg-black lg:dark:bg-black/30",
      "min-h-svh",
      !isOpen && "border-r-transparent",
      isOpen && "w-full",
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
        <div className="w-full min-h-svh overflow-hidden">
          <div className="w-full h-full p-5 overflow-auto min-h-svh">
            <div className="flex h-14 items-center border-b mb-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-2 font-semibold"
                onClick={(e) => e.preventDefault()}
              >
                {/* <Package2 className="h-6 w-6" /> */}
                <span>Aether notes</span>
              </Link>
              {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button> */}
              <NotebookDialog>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add new notebook</span>
                </Button>
              </NotebookDialog>
            </div>

            <div className="flex-1">
              <nav className="grid items-start text-sm font-medium">
                {treeData.map((notebook) => (
                  <div key={notebook.id}>
                    <TreeMenu
                      data={notebook}
                      level={0}
                      id={notebook.id}
                      title={notebook.title}
                      editor={editor}
                    />
                  </div>
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
