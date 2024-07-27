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
import {
  ArrowDown,
  ChevronDown,
  MoveDown,
  Plus,
  SquarePen,
  Trash2,
} from "lucide-react";
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
import useNoteDialogStore from "@/store/note-dialog";
import { ReactSketchCanvasRef, CanvasPath } from "react-sketch-canvas";
import { Tree } from "react-arborist";
import Node from "@/components/Sidebar/Arborist";
import {
  StaticTreeDataProvider,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";

export const Sidebar = memo(
  ({
    editor,
    isOpen,
    onClose,
    canvasRef,
  }: {
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
    canvasRef: ReactSketchCanvasRef | null;
  }) => {
    // referees
    const treeRef = React.useRef(null);

    const [notebooks, sections, notes] = useQueries([
      notebooksQuery,
      sectionsQuery,
      notesQuery,
    ]);

    // State
    const [treeData, setTreeData] = React.useState();

    // Make treeview data
    const convertToTreeStructure = (data) => {
      const allItems = [...data.notebooks, ...data.sections, ...data.notes];

      const findChildren = (parentId) => {
        return allItems
          .filter(
            (item) =>
              item.parentId === parentId ||
              (item.notebookId === parentId && item.sectionId === null),
          )
          .map(processItem)
          .filter(Boolean);
      };

      const processItem = (item) => {
        const children = findChildren(item.id);
        const result = {
          id: item.id,
          name: item.name || "[Unnamed]",
          type: item.type,
        };

        if (children.length > 0) {
          result.children = children;
        }

        return result;
      };

      return data.notebooks.map(processItem);
    };

    const transformData = React.useCallback((notebooks, sections, notes) => {
      const normalizedData = {
        notebooks: notebooks.rows.map((notebook) => ({
          id: notebook.id,
          name: notebook.title,
          type: "notebook",
          children: [],
        })),
        sections: sections.rows.map((section) => ({
          id: section.id,
          name: section.title,
          type: "section",
          notebookId: section.notebookId,
          parentId: section.notebookId || null,
          children: [],
        })),
        notes: notes.rows.map((note) => ({
          id: note.id,
          name: note.title,
          type: "note",
          notebookId: note.notebookId,
          sectionId: note.sectionId,
          parentId: note.sectionId || note.notebookId,
        })),
      };

      const treeStructure = convertToTreeStructure(normalizedData);
      return treeStructure;
    }, []); // Empty dependency array as convertToTreeStructure is defined inside the component

    React.useEffect(() => {
      const getData = async () => {
        const transformedData = transformData(notebooks, sections, notes);
        setTreeData(transformedData);
        // console.log("State", treeData);
      };

      getData();
    }, [notebooks, sections, notes, transformData]);

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

    return (
      <div className={windowClassName}>
        <div className="w-full min-h-svh overflow-hidden">
          <div className="w-full h-full px-5 pb-5 overflow-auto min-h-svh">
            <div className="flex h-14 items-center border-b mb-3">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold"
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
                  <SquarePen className="h-4 w-4" />
                  <span className="sr-only">Add new notebook</span>
                </Button>
              </NotebookDialog>
            </div>

            <div className="flex-1">
              <nav className="grid items-start text-sm font-medium">
                <Button
                  variant="ghost"
                  className="text-zinc-400 text-sm justify-between"
                >
                  <span>NOTEBOOKS</span>
                  <ChevronDown />
                </Button>
                <div>
                  <Tree ref={treeRef} initialData={treeData}>
                    {Node}
                  </Tree>
                  {/* <Tree initialData={treeData} /> */}

                  {/* {treeData.map((notebook) => (
                    <div key={notebook.id}>
                      <TreeMenu
                        data={notebook}
                        level={1}
                        id={notebook.id}
                        title={notebook.title}
                        editor={editor}
                        canvasRef={canvasRef}
                      />
                    </div>
                  ))} */}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Sidebar.displayName = "TableOfContentSidepanel";
