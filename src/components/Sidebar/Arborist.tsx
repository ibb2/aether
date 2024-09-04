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
import { sectionsQuery, settingQuery } from "@/db/queries";

const Node = ({ node, style, dragHandle, tree }) => {
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

  const [exportedDataRows, noteSettings, sections, settings] = useQueries([
    exportedDataQuery(),
    noteSettingsQuery(),
    sectionsQuery,
    settingQuery,
  ]);

  const [selectedSection, setSelectedSection] = React.useState(node.id);

  const { create, update } = useEvolu<Database>();

  const handleDialogOpen = (dialogType: string) => {
    if (dialogType === "section") {
      onSectionDialog(true);
      onNoteDialog(false);
    } else {
      onSectionDialog(false);
      onNoteDialog(true);
    }
    // Use a timeout to ensure the dialog is rendered before focusing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  // console.log(node.is)
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

  const newSection = () => {
    // For creating sections

    if (node.level === 0) {
      // Create a new section from notebook
      const { id: sectionId } = create("sections", {
        title: S.decodeSync(NonEmptyString1000)(sectionName),
        notebookId: S.decodeSync(NotebookId)(node.id),
        isFolder: true,
        isSection: true,
      });
    } else {
      // Create a new section from a section
      console.log(tree.prevNode);
      console.log(node.id);
      console.log(S.decodeSync(SectionId)(node.id));
      console.log("hey", node.data);

      const { id: sectionId } = create("sections", {
        title: S.decodeSync(NonEmptyString1000)(sectionName),
        parentId: S.decodeSync(SectionId)(node.id),
        notebookId: S.decodeSync(NotebookId)(node.data.notebookId),
        isFolder: true,
        isSection: true,
      });

      // Update the parent section to include the new child section
      const parentSection = tree.get(node.id);
      if (parentSection) {
        const updatedChildren = [
          ...(parentSection.data.children || []),
          { id: sectionId, type: "section" },
        ];
        update("sections", {
          id: S.decodeSync(SectionId)(node.id),
          childrenId: updatedChildren.map((child) => child.id),
        });

        // Update the tree structure
        tree.edit(node.id, {
          ...parentSection.data,
          children: updatedChildren,
        });
      }
    }

    // Clear the input and close the dialog
    setSectionName("");
    onSectionDialog(false);
  };

  const newNote = () => {
    // For creating note

    let newNote: NoteId;

    if (node.level === 0) {
      // from a notebook (root)
      const { id: noteId } = create("notes", {
        title: S.decodeSync(NonEmptyString1000)(noteName),
        notebookId: S.decodeSync(NotebookId)(node.id),
      });

      newNote = noteId;
    } else {
      // from a section (folder)
      const { id: noteId } = create("notes", {
        title: S.decodeSync(NonEmptyString1000)(noteName),
        notebookId: S.decodeSync(NotebookId)(node.data.notebookId),
        sectionId: S.decodeSync(SectionId)(selectedSection),
      });

      const prevChildrenIds = node.data.children
        .filter((node) => node.type === "note")
        .map((node) => S.decodeSync(NoteId)(node.id));

      update("sections", {
        id: S.decodeSync(SectionId)(selectedSection),
        notesId: [...prevChildrenIds, noteId],
      });

      newNote = noteId;
    }

    create("exportedData", {
      noteId: newNote,
      jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${newNote}`),
      jsonData: initialContent,
    });

    create("noteSettings", {
      noteId: newNote,
      pageType: 1,
      isInkEnabled: cast(true),
      isPageSplit: cast(false),
    });

    console.log(tree.prevNode);
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

  const defaultNote = () => {
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

  React.useEffect(() => {
    if (settings.row !== null) {
      console.log("settings exist arborist", settings.row);
      editor?.commands.setContent(settings.row.defaultPage);
      defaultNote();
    }
  }, [editor]);

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
              if (node.isLeaf && node.data.type === "note") {
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
                {tree.root.children
                  .map((node) => node.id)
                  .includes(node.id) && (
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
                handleDialogOpen("section");
                e.preventDefault();
              }}
            >
              <span>New Section</span>
            </ContextMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <ContextMenuItem
              onSelect={(e) => {
                handleDialogOpen("note");
                e.preventDefault();
              }}
            >
              <span>New Note</span>
            </ContextMenuItem>
          </DialogTrigger>
          <ContextMenuSeparator />
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
        {sectionDialog && (
          <DialogContent
            className="sm:max-w-[425px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle>New Section</DialogTitle>
              <DialogDescription>
                Organise your thoughts and ideas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                placeholder="new section"
                onChange={(e) => setSectionName(e.target.value)}
                ref={inputRef}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  onClick={() => onSectionDialog(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="submit"
                  onClick={() => {
                    newSection();
                    onSectionDialog(false);
                  }}
                >
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
        {noteDialog && (
          <DialogContent
            className="sm:max-w-[425px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
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
                  onChange={(e) => setNoteName(e.target.value)}
                  ref={inputRef}
                />
              </div>
            </div>
            {node.level > 0 && (
              <div className="grid w-full max-w-sm items-center gap-1.5 pt-2.5">
                <Select
                  value={S.decodeSync(String)(selectedSection)}
                  onValueChange={(value) => {
                    setSelectedSection(S.decodeSync(SectionId)(value));
                    console.info("Changed value", value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={sections.rows[0].title} />
                  </SelectTrigger>
                  <SelectContent id="notebooks" className="w-full">
                    {sections.rows.map((section, index) => (
                      <SelectItem
                        value={section.id}
                        key={index}
                        className="w-full"
                      >
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" onClick={() => onNoteDialog(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    newNote();
                    onNoteDialog(false);
                  }}
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
