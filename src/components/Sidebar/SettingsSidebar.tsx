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
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  EyeOff,
  MoveDown,
  Plus,
  Settings,
  SquarePen,
  Trash2,
  User,
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
import "react-complex-tree/lib/style-modern.css";
import useResizeObserver from "use-resize-observer";

export const SettingsSidebar = memo(
  ({
    editor,
    isOpen,
    onClose,
    canvasRef,
    // width,
  }: {
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
    canvasRef: ReactSketchCanvasRef | null;
    // width: number;
  }) => {
    // referees
    const treeRef = React.useRef(null);

    // Use resize obserer
    const { ref, width, height } = useResizeObserver<HTMLDivElement>();

    const [notebooks, sections, notes] = useQueries([
      notebooksQuery,
      sectionsQuery,
      notesQuery,
    ]);

    // State
    const [treeData, setTreeData] = React.useState();

    // React Arborist
    /* Handle the data modifications outside the tree component */
    const onCreate = ({ parentId, index, type }) => {};
    const onRename = ({ id, name }) => {};
    const onMove = ({ dragIds, parentId, index }) => {};
    const onDelete = ({ ids }) => {};

    // Make treeview data
    const convertToTreeStructure = (data) => {
      const allItems = [...data.notebooks, ...data.sections, ...data.notes];
      const itemMap = new Map(
        allItems.map((item) => [item.id, { ...item, children: [] }]),
      );

      const findChildren = (parentId, notebookId) => {
        return allItems.filter((item) => {
          if (item.type === "note") {
            return (
              item.sectionId === parentId ||
              (item.notebookId === parentId && !item.sectionId)
            );
          } else {
            return (
              item.parentId === parentId ||
              (item.notebookId === notebookId && !item.parentId)
            );
          }
        });
      };

      const processItem = (item) => {
        const children = findChildren(item.id, item.id).map(processItem);
        const result = {
          id: item.id,
          name: item.name || item.title || "[Unnamed]",
          type: item.type,
          notebookId: item.notebookId,
          parentId: item.parentId,
        };
        if (children.length > 0) {
          result.children = children;
        }
        return result;
      };

      // Process only notebooks at the top level
      const tree = data.notebooks.map(processItem);

      return tree;
    };

    const transformData = (notebooks, sections, notes) => {
      const normalizedData = {
        notebooks: notebooks.rows.map((notebook) => ({
          id: notebook.id,
          name: notebook.title,
          type: "notebook",
        })),
        sections: sections.rows.map((section) => ({
          id: section.id,
          name: section.title,
          type: "section",
          notebookId: section.notebookId,
          parentId: section.parentId,
        })),
        notes: notes.rows.map((note) => ({
          id: note.id,
          name: note.title,
          type: "note",
          notebookId: note.notebookId,
          sectionId: note.sectionId,
        })),
      };

      return normalizedData;
    };

    React.useEffect(() => {
      const getData = async () => {
        const transformedData = transformData(notebooks, sections, notes);
        const treeStructure = convertToTreeStructure(transformedData);
        setTreeData(treeStructure);
      };

      getData();
    }, [notebooks, sections, notes]);

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
      <div className={cn(windowClassName, "px-5")} ref={ref}>
        <div className="w-full min-h-svh overflow-hidden">
          <div className="flex flex-col justify-between w-full h-full pb-5 overflow-auto min-h-svh">
            <div>
              <div className="flex h-14 items-center border-b mb-3">
                <Link
                  href="/app"
                  className="flex items-center gap-2 font-semibold"
                  onClick={(e) => e.preventDefault()}
                >
                  <ArrowLeft className="h-6 w-6" />
                  <span>Settings</span>
                </Link>
              </div>

              <nav className="grid items-start font-medium">
                <Button
                  variant="ghost"
                  className="w-full justify-start items-center"
                  asChild
                >
                  <Link href="#" className="w-full gap-2">
                    <User />
                    Account
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start items-center"
                  asChild
                >
                  <Link href="#" className="w-full gap-2">
                    <EyeOff />
                    Privacy
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

SettingsSidebar.displayName = "SettingsTableOfContentSidepanel";
