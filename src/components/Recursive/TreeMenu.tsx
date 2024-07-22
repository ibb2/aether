import * as S from "@effect/schema/Schema";
import { Database, evolu } from "@/db/db";
import { notebooksQuery, notesQuery, sectionsQuery } from "@/db/queries";
import {
  NonEmptyString50,
  NotebookId,
  NotebooksTable,
  SectionId,
  SectionsTable,
} from "@/db/schema";
import {
  NonEmptyString1000,
  useEvolu,
  useQueries,
  useQuery,
} from "@evolu/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SectionDialog } from "../dialogs/section";
import { NoteDialog } from "../dialogs/note";
import { cn } from "@/lib/utils";
import { Brand } from "effect/Brand";
import useNoteStore from "@/store/note";
import { Editor } from "@tiptap/react";
import useNoteDialogStore from "@/store/note-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { initialContent } from "@/lib/data/initialContent";
import { Button } from "../ui/Button";
import { ReactSketchCanvasRef, CanvasRef } from "react-sketch-canvas";

interface TreeMenuProps {
  id: any;
  title: any;
  data: any;
  level: number;
  editor: Editor;
  canvasRef: ReactSketchCanvasRef | null;
}

const TreeMenu = ({
  id,
  title,
  data,
  level,
  editor,
  canvasRef,
}: TreeMenuProps) => {
  const [show, setShow] = React.useState(false);
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [notebookDialogOpen, setNotebookDialogOpen] = React.useState(false);
  const [notebookDialog2Open, setNotebookDialog2Open] = React.useState(false);

  const { update } = useEvolu<Database>();
  const [notes, sections] = useQueries([notesQuery, sectionsQuery]);

  const hasChildren = data.sections?.length > 0 || data.notes?.length > 0;

  const isSection = data.isSection === 1;
  const isNote = data.isNote === 1;

  const indentLevel = cn(isSection && "ml-8");

  const [noteName, setNoteName] = React.useState("");

  const { rows } = useQuery(notebooksQuery);
  const { create } = useEvolu<Database>();

  const [sectionName, setSectionName] = React.useState("");

  const dialog1handler = (
    parent: SectionsTable,
    parentSectionId: string & Brand<"Id"> & Brand<"Section">,
  ) => {
    console.info("Section", parent);
    console.info("Id for section", parentSectionId);
    console.info("Level", level);
    const { id: newId } = create("sections", {
      title: S.decodeSync(NonEmptyString1000)(sectionName),
      notebookId: id,
      isFolder: true,
      isSection: true,
      parentId: level > 1 ? parentSectionId : null,
    });

    if (level > 1) {
      const previousChildrenIds =
        parent.childrenId != null ? [...parent.childrenId, newId] : [newId];

      update("sections", {
        id: parentSectionId,
        childrenId: previousChildrenIds,
      });
    }
  };

  const [selectedNotebook, setSelectedNotebook] = React.useState(id);
  const [section, setSection] = React.useState(isSection ? data.id : null);

  const handler = () => {
    // const { id: noteId } = create("notes", {
    //   title: S.decodeSync(NonEmptyString1000)(noteName),
    //   notebookId: selectedNotebook,
    //   sectionId: section,
    // });

    // const newNotesId =
    //   section.notesId != null ? [...section.notesId, noteId] : [noteId];
    console.log("Section ", section);

    // update("sections", { id: section.id, notesId: newNotesId });

    // const { id: exportedDataId } = create("exportedData", {
    //   noteId,
    //   jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${noteId}`),
    //   jsonData: initialContent,
    // });

    // console.log("Exported Data for note created: ", exportedDataId);
  };

  const notebookDialogHandler = () => {
    // For creating sections

    const { id: sectionId } = create("sections", {
      title: S.decodeSync(NonEmptyString1000)(sectionName),
      notebookId: selectedNotebook,
    });

    console.log("Section ", selectedNotebook);
  };

  const notebookDialog2Handler = () => {
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
  // Zustand stores
  const setNote = useNoteStore((state) => state.setNote);

  const { isOpen, toggle } = useNoteDialogStore((s) => ({
    isOpen: s.isOpen,
    toggle: s.toggle,
  }));

  // Move the exportedDataQuery outside of selectNote
  const exportedDataQuery = evolu.createQuery((db) =>
    db
      .selectFrom("exportedData")
      .select("id")
      .select("jsonData")
      .select("noteId")
      .select("inkData"),
  );

  // Use the query result here
  const { rows: exportedDataRows } = useQuery(exportedDataQuery);

  const deleteNote = (noteId: string & Brand<"Id"> & Brand<"Note">) => {
    update("notes", { id: noteId, isDeleted: true });
  };

  // Update selectNote to use the query results
  const selectNote = (noteId: string & Brand<"Id"> & Brand<"Note">) => {
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
      editor.commands.setContent(exportedData.jsonData!);
    }
  };

  const className = cn(
    "flex flex-row items-center py-2 rounded-lg hover:bg-muted w-full cursor-pointer",
    isSection && "px-9",
    !isSection && !isNote && "px-2.5",
  );

  return (
    <div>
      <div
        onClick={(e) => {
          setShow(!show);
          e.preventDefault();
        }}
        className={className}
        key={id}
        style={{ paddingLeft: level > 0 ? level * 20 : level * 30 }}
      >
        <div className="pr-2">
          {hasChildren &&
            (show ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </div>
        {!isSection && level === 1 ? (
          <Dialog>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div
                  className="items-center gap-3 rounded-lg text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  {/* <Home className="h-4 w-4" /> */}
                  {data.title}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <DialogTrigger asChild>
                  <ContextMenuItem
                    onSelect={(e) => {
                      setNotebookDialog2Open(false);
                      setNotebookDialogOpen(true);
                      e.preventDefault();
                    }}
                  >
                    <span>New Section (folder)</span>
                  </ContextMenuItem>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <ContextMenuItem
                    onSelect={(e) => {
                      setNotebookDialogOpen(false);
                      setNotebookDialog2Open(true);
                      e.preventDefault();
                    }}
                  >
                    <span>New Note</span>
                  </ContextMenuItem>
                </DialogTrigger>
              </ContextMenuContent>
              {notebookDialogOpen && (
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
                      <Button type="submit" onClick={notebookDialogHandler}>
                        Create
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              )}
              {notebookDialog2Open && (
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
                        onChange={(e) => setNoteName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button type="submit" onClick={notebookDialog2Handler}>
                        Create
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              )}
            </ContextMenu>
          </Dialog>
        ) : (
          <Dialog>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div
                  className="items-center gap-3 rounded-lg text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  {/* <Home className="h-4 w-4" /> */}
                  {data.title}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <DialogTrigger asChild>
                  <ContextMenuItem
                    onSelect={(e) => {
                      setDialog2Open(false);
                      setDialog1Open(true);
                      e.preventDefault();
                    }}
                  >
                    <span>New Section (folder)</span>
                  </ContextMenuItem>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <ContextMenuItem
                    onSelect={(e) => {
                      setDialog1Open(false);
                      setDialog2Open(true);
                      e.preventDefault();
                    }}
                  >
                    <span>New Note</span>
                  </ContextMenuItem>
                </DialogTrigger>
              </ContextMenuContent>
              {dialog1Open && (
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
                        onClick={() => dialog1handler(data, data.id)}
                      >
                        Create
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              )}
              {dialog2Open && (
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
                        onChange={(e) => setNoteName(e.target.value)}
                      />
                    </div>
                    {/* {!isSection ? (
                      <div className="w-full pb-2">
                        <Label htmlFor="notebooks">Notebooks</Label>
                        <Select
                          value={selectedNotebook}
                          onValueChange={(value) => {
                            setSection(S.decodeSync(SectionId)(value));
                            console.info("Changed value", value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={rows[0].title} />
                          </SelectTrigger>
                          <SelectContent id="notebooks" className="w-full">
                            {rows.map((notebook, index) => (
                              <SelectItem
                                value={notebook.id}
                                key={index}
                                className="w-full"
                              >
                                {notebook.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : ( */}
                    <div className="w-full pb-2">
                      <Label htmlFor="notebooks">Section</Label>
                      <Select
                        value={section}
                        onValueChange={(value) => {
                          setSection(S.decodeSync(SectionId)(value));
                          console.info("Changed value", value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={data.title} />
                        </SelectTrigger>
                        <SelectContent id="notebooks" className="w-full">
                          <SelectItem value={data.id} className="w-full">
                            {data.title}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* )} */}
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
            </ContextMenu>
          </Dialog>
        )}
      </div>
      {show && (
        <>
          {data.sections?.map((section, index) => {
            return (
              <>
                {section !== undefined && (
                  <TreeMenu
                    // key={section.id}
                    key={section.id}
                    id={id}
                    title={title}
                    data={section}
                    level={level + 1}
                    editor={editor}
                    canvasRef={canvasRef}
                  />
                )}
              </>
            );
          })}
          {data.notes?.map((note) => (
            <div
              key={note.id}
              className="px-4 rounded-md hover:bg-muted w-full"
              onClick={() => {
                selectNote(note.id);
              }}
              style={{ paddingLeft: level > 0 ? level * 30 : level * 40 }}
            >
              <NoteDialog notebookId={id} notebookTitle={title} section={null}>
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div className="items-center gap-3 pl-5 py-1 border-l-2 border-l-muted text-muted-foreground hover:text-primary hover:bg-muted w-full cursor-pointer">
                      {/* <Home className="h-4 w-4" /> */}
                      {note.title}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem>
                      <p className="w-full">Rename</p>
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <p className="w-full">Edit</p>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        deleteNote(note.id);
                      }}
                    >
                      <p className="w-full">Delete</p>
                      {/* New Note */}
                    </ContextMenuItem>
                    {/* <ContextMenuItem>Team</ContextMenuItem>
                    <ContextMenuItem>Subscription</ContextMenuItem> */}
                  </ContextMenuContent>
                </ContextMenu>
              </NoteDialog>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TreeMenu;
