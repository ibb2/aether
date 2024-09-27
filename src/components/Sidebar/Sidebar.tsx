"use client";

import * as S from "@effect/schema/Schema";

import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { NotebookDialog } from "../dialogs/notebook";
import {
  NonEmptyString1000,
  useEvolu,
  useQueries,
  useQuery,
} from "@evolu/react";
import {
  fragmentsQuery,
  notebooksQuery,
  notesQuery,
  sectionsQuery,
} from "@/db/queries";
import { Button } from "../ui/Button";
import {
  Diamond,
  File,
  FileIcon,
  Notebook,
  Settings,
  SquarePen,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { ReactSketchCanvasRef } from "react-sketch-canvas";
import { Tree } from "react-arborist";
import Node from "@/components/Sidebar/Arborist";
import useResizeObserver from "use-resize-observer";
import { Popover, PopoverTrigger } from "../ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database, evolu } from "@/db/db";
import { NonEmptyString50, NoteId } from "@/db/schema";
import { initialContent } from "@/lib/data/initialContent";
import FragmentNode from "./FragmentNode";
import { TreeDataItem, TreeView } from "../tree-view";
import useStateStore from "@/store/state";
import useNoteStore from "@/store/note";

export const Sidebar = memo(
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
    const fragmentTreeRef = React.useRef(null);

    // Use resize obserer
    const { ref, width, height } = useResizeObserver<HTMLDivElement>();

    const [notebooks, sections, notes] = useQueries([
      notebooksQuery,
      sectionsQuery,
      notesQuery,
    ]);

    const { rows: fragments } = useQuery(fragmentsQuery);

    // State
    const [treeData, setTreeData] = React.useState();
    const [fragmentsData, setFragmentsData] = React.useState<TreeDataItem[]>(
      [],
    );

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

      const getFragmentsData = async () => {
        console.info("fragments", fragments);

        const arr = [];

        for (let i = 0; i < fragments.length; i++) {
          arr.push({
            id: fragments[i].id,
            name: S.decodeSync(S.String)(fragments[i].title!),
          });
        }

        setFragmentsData([...arr]);
      };

      getFragmentsData();
      getData();
    }, [notebooks, sections, notes, fragments]);

    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    }, [onClose]);

    const [notebookName, setNotebookName] = React.useState("");
    const [notebookOpen, onNotebookOpen] = React.useState(false);

    const [fragmentName, setFragmentName] = React.useState("");
    const [fragmentOpen, onFragmentOpen] = React.useState(false);

    const { create, createOrUpdate } = useEvolu<Database>();

    const handler = () => {
      create("notebooks", {
        title: S.decodeSync(NonEmptyString1000)(notebookName),
      });
    };

    const createNoteFragment = () => {
      const { id } = create("notes", {
        title: S.decodeSync(NonEmptyString1000)(fragmentName),
        isFragment: true,
      });

      create("exportedData", {
        noteId: id,
        jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${id}`),
        jsonData: initialContent,
      });
    };

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
      () =>
        evolu.createQuery((db) => db.selectFrom("noteSettings").selectAll()),
      [],
    );

    const [exportedDataRows, noteSettings] = useQueries([
      exportedDataQuery(),
      noteSettingsQuery(),
    ]);

    // const [selectedSection, setSelectedSection] = React.useState(node.id);

    const { update } = useEvolu<Database>();

    // Update selectNote to use the query results
    const selectNote = (item: TreeDataItem | undefined) => {
      console.info("selected item ", item);

      if (item !== undefined) {
        const exportedData = exportedDataRows.rows.find(
          (row) => row.noteId === item.id,
        );
        const noteSetting = noteSettings.rows.find(
          (row) => row.noteId === item.id,
        );
        console.log("JSON Data, ", exportedData?.jsonData);
        console.log("INK Data, ", exportedData?.inkData);
        if (exportedData) {
          setNote(
            exportedData.jsonData!,
            S.decodeSync(NonEmptyString50)(exportedData.noteId ?? ""),
            S.decodeSync(NoteId)(item.id),
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
      }
    };

    // const deleteNode = () => {
    //   if (node.level !== 0) {
    //     if (node.data.type === "section") {
    //       update("sections", {
    //         id: S.decodeSync(SectionId)(node.id),
    //         isDeleted: true,
    //       });
    //     }
    //     if (node.data.type === "note") {
    //       update("notes", {
    //         id: S.decodeSync(NoteId)(node.id),
    //         isDeleted: true,
    //       });
    //     }
    //   }
    // };

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
            <div className="flex flex-col gap-y-6">
              <div className="flex h-14 items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold"
                  onClick={(e) => e.preventDefault()}
                >
                  {/* <Package2 className="h-6 w-6" /> */}
                  <h1 className="text-lg">Aether notes</h1>
                </Link>
                {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button> */}
                <Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SquarePen className="cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onClick={(e) => {
                              onFragmentOpen(false);
                              onNotebookOpen(true);
                            }}
                          >
                            <Notebook className="mr-2 h-4 w-4" />
                            <span>New Notebook</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogTrigger>
                          <DropdownMenuItem
                            onClick={(e) => {
                              onFragmentOpen(true);
                              onNotebookOpen(false);
                            }}
                          >
                            <Diamond className="mr-2 h-4 w-4" />
                            <span>Fragment Note</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {notebookOpen && (
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>New notebook</DialogTitle>
                        <DialogDescription>
                          Organise your toughts and ideas in a new space.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          type="text"
                          id="name"
                          placeholder="new notebook"
                          onChange={(e) => setNotebookName(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button type="submit" onClick={handler}>
                            Create
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  )}
                  {fragmentOpen && (
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Fragment notes</DialogTitle>
                        <DialogDescription>
                          Quickly take down your notes.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          type="text"
                          id="name"
                          placeholder="loose leaf paper"
                          onChange={(e) => setFragmentName(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button type="submit" onClick={createNoteFragment}>
                            Create
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
              <nav className="flex flex-col items-start w-full text-sm font-medium gap-y-4">
                <div className="w-full">
                  <span className="mb-2 text-zinc-400 text-sm">FRAGMENTS</span>
                  <div
                    className="max-h-fit w-full"
                    style={{ height: "!important auto" }}
                  >
                    {fragmentsData !== undefined && (
                      <TreeView
                        data={fragmentsData}
                        onSelectChange={(item) => {
                          selectNote(item);
                        }}
                        defaultLeafIcon={FileIcon}
                        className="ml-0 w-full"
                      />
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <span className="mb-2 text-zinc-400 text-sm justify-between">
                    NOTEBOOKS
                  </span>
                  {treeData !== undefined && (
                    <TreeView
                      data={treeData}
                      onSelectChange={(item) => {
                        selectNote(item);
                      }}
                      defaultLeafIcon={FileIcon}
                      className="w-full"
                    />
                  )}
                </div>
              </nav>
            </div>

            <div>
              <Link href={"/settings"}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mb-2 text-zinc-400 text-sm w-full text-left justify-start gap-x-2"
                >
                  <Settings />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Sidebar.displayName = "TableOfContentSidepanel";
