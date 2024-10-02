"use client";

import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as S from "@effect/schema/Schema";
import { ChevronRight, Trash } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/dialog";
import { useEvolu, useQueries, useQuery } from "@evolu/react";
import {
  NonEmptyString50,
  NoteId,
  SectionId,
  SectionsTable,
} from "@/db/schema";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/Button";
import {
  notebooksQuery,
  notesQuery,
  sectionsQuery,
  settingQuery,
} from "@/db/queries";
import { Database, evolu } from "@/db/db";
import useNoteDialogStore from "@/store/note-dialog";
import useNoteStore from "@/store/note";
import useStateStore from "@/store/state";

const treeVariants = cva(
  "group hover:before:opacity-100 before:absolute before:rounded-lg before:left-0 px-2 before:w-full before:opacity-0 before:bg-accent/70 before:h-[2rem] before:-z-10",
);

const selectedTreeVariants = cva(
  "before:opacity-100 before:bg-accent/70 text-accent-foreground",
);

interface TreeDataItem {
  id: string;
  name: string;
  icon?: any;
  selectedIcon?: any;
  openIcon?: any;
  children?: TreeDataItem[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem;
  initialSelectedItemId?: string;
  onSelectChange?: (item: TreeDataItem | undefined) => void;
  expandAll?: boolean;
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
};

const TreeView = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      initialSelectedItemId,
      onSelectChange,
      expandAll,
      defaultLeafIcon,
      defaultNodeIcon,
      className,
      ...props
    },
    ref,
  ) => {
    const [selectedItemId, setSelectedItemId] = React.useState<
      string | undefined
    >(initialSelectedItemId);

    const handleSelectChange = React.useCallback(
      (item: TreeDataItem | undefined) => {
        setSelectedItemId(item?.id);
        if (onSelectChange) {
          onSelectChange(item);
        }
      },
      [onSelectChange],
    );

    const expandedItemIds = React.useMemo(() => {
      if (!initialSelectedItemId) {
        return [] as string[];
      }

      const ids: string[] = [];

      function walkTreeItems(
        items: TreeDataItem[] | TreeDataItem,
        targetId: string,
      ) {
        if (items instanceof Array) {
          for (let i = 0; i < items.length; i++) {
            ids.push(items[i]!.id);
            if (walkTreeItems(items[i]!, targetId) && !expandAll) {
              return true;
            }
            if (!expandAll) ids.pop();
          }
        } else if (!expandAll && items.id === targetId) {
          return true;
        } else if (items.children) {
          return walkTreeItems(items.children, targetId);
        }
      }

      walkTreeItems(data, initialSelectedItemId);
      return ids;
    }, [data, expandAll, initialSelectedItemId]);

    return (
      <div className={cn("overflow-hidden relative p-2", className)}>
        <TreeItem
          data={data}
          ref={ref}
          selectedItemId={selectedItemId}
          handleSelectChange={handleSelectChange}
          expandedItemIds={expandedItemIds}
          defaultLeafIcon={defaultLeafIcon}
          defaultNodeIcon={defaultNodeIcon}
          className={className}
          {...props}
        />
      </div>
    );
  },
);

TreeView.displayName = "TreeView";

type TreeItemProps = TreeProps & {
  selectedItemId?: string;
  handleSelectChange: (item: TreeDataItem | undefined) => void;
  expandedItemIds: string[];
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
};

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      data,
      selectedItemId,
      handleSelectChange,
      expandedItemIds,
      defaultNodeIcon,
      defaultLeafIcon,
      ...props
    },
    ref,
  ) => {
    if (!(data instanceof Array)) {
      data = [data];
    }
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
      () =>
        evolu.createQuery((db) => db.selectFrom("noteSettings").selectAll()),
      [],
    );

    const [exportedDataRows, noteSettings, sections, settings] = useQueries([
      exportedDataQuery(),
      noteSettingsQuery(),
      sectionsQuery,
      settingQuery,
    ]);

    const [selectedSection, setSelectedSection] = React.useState();

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
      const noteSetting = noteSettings.rows.find(
        (row) => row.noteId === noteId,
      );
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
          update("notes", {
            id: S.decodeSync(NoteId)(node.id),
            isDeleted: true,
          });
        }
      }
    };

    const defaultNote = (
      noteId: (string & Brand<"Id"> & Brand<"Note">) | null,
      exportedDataId: (string & Brand<"Id"> & Brand<"ExportedData">) | null,
    ) => {
      // const noteId = S.decodeSync(NoteId)(node.id);
      const exportedData = exportedDataRows.rows.find(
        (row) => row.noteId === noteId!,
      );
      const noteSetting = noteSettings.rows.find(
        (row) => row.noteId === noteId,
      );
      console.log("JSON Data, ", exportedData?.jsonData);
      console.log("INK Data, ", exportedData?.inkData);

      if (exportedData) {
        setNote(
          exportedData.jsonData!,
          S.decodeSync(NonEmptyString50)(exportedData.noteId ?? "default"),
          noteId!,
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
        const noteId = settings.row.lastAccessedNote;
        const exportedDataId = settings.row.defaultPageExport;
        console.log("settings exist arborist", settings.row);
        editor?.commands.setContent(settings.row.defaultPage);
        defaultNote(noteId, exportedDataId);
      }
    }, [editor]);

    return (
      <div ref={ref} role="tree" className={className} {...props}>
        <Dialog>
          <ul>
            {data.map((item) => (
              <ContextMenu key={item.id}>
                <ContextMenuTrigger>
                  <li>
                    {item.children ? (
                      <TreeNode
                        item={item}
                        selectedItemId={selectedItemId}
                        expandedItemIds={expandedItemIds}
                        handleSelectChange={handleSelectChange}
                        defaultNodeIcon={defaultNodeIcon}
                        defaultLeafIcon={defaultLeafIcon}
                      />
                    ) : (
                      <TreeLeaf
                        item={item}
                        selectedItemId={selectedItemId}
                        handleSelectChange={handleSelectChange}
                        defaultLeafIcon={defaultLeafIcon}
                        className={className}
                      />
                    )}
                  </li>
                </ContextMenuTrigger>
                {item.children ? (
                  <>
                    <ContextMenuContent>
                      <DialogTrigger asChild>
                        <ContextMenuItem
                          onSelect={(e) => {
                            handleDialogOpen("note");
                            e.preventDefault();
                          }}
                        >
                          <span>Rename</span>
                        </ContextMenuItem>
                      </DialogTrigger>
                      <ContextMenuSeparator />
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
                  </>
                ) : (
                  <ContextMenuContent>
                    <ContextMenuItem
                      onSelect={(e) => {
                        deleteNode(item);
                        e.preventDefault();
                      }}
                    >
                      <span>Delete</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                )}
              </ContextMenu>
            ))}
          </ul>
        </Dialog>
      </div>
    );
  },
);

TreeItem.displayName = "TreeItem";

const TreeNode = ({
  item,
  handleSelectChange,
  expandedItemIds,
  selectedItemId,
  defaultNodeIcon,
  defaultLeafIcon,
}: {
  item: TreeDataItem;
  handleSelectChange: (item: TreeDataItem | undefined) => void;
  expandedItemIds: string[];
  selectedItemId?: string;
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
}) => {
  const [value, setValue] = React.useState(
    expandedItemIds.includes(item.id) ? [item.id] : [],
  );

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={value}
      onValueChange={(s) => setValue(s)}
    >
      <AccordionPrimitive.Item value={item.id}>
        <AccordionTrigger
          className={cn(
            treeVariants(),
            selectedItemId === item.id && selectedTreeVariants(),
          )}
          onClick={() => {
            handleSelectChange(item);
            item.onClick?.();
          }}
        >
          <TreeIcon
            item={item}
            isSelected={selectedItemId === item.id}
            isOpen={value.includes(item.id)}
            default={defaultNodeIcon}
          />
          <span className="text-sm truncate">{item.name}</span>
          <TreeActions isSelected={selectedItemId === item.id}>
            {item.actions}
          </TreeActions>
        </AccordionTrigger>
        <AccordionContent className="ml-4 pl-1 border-l">
          <TreeItem
            data={item.children ? item.children : item}
            selectedItemId={selectedItemId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            defaultLeafIcon={defaultLeafIcon}
            defaultNodeIcon={defaultNodeIcon}
          />
        </AccordionContent>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
};

const TreeLeaf = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    item: TreeDataItem;
    selectedItemId?: string;
    handleSelectChange: (item: TreeDataItem | undefined) => void;
    defaultLeafIcon?: any;
  }
>(
  (
    {
      className,
      item,
      selectedItemId,
      handleSelectChange,
      defaultLeafIcon,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "ml-5 flex text-left items-center py-2 cursor-pointer before:right-1",
          treeVariants(),
          className,
          selectedItemId === item.id && selectedTreeVariants(),
        )}
        onClick={() => {
          handleSelectChange(item);
          item.onClick?.();
        }}
        {...props}
      >
        <TreeIcon
          item={item}
          isSelected={selectedItemId === item.id}
          default={defaultLeafIcon}
        />
        <span className="flex-grow text-sm truncate">{item.name}</span>
        <TreeActions isSelected={selectedItemId === item.id}>
          {item.actions}
        </TreeActions>
      </div>
    );
  },
);

TreeLeaf.displayName = "TreeLeaf";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 w-full items-center py-2 transition-all first:[&[data-state=open]>svg]:rotate-90",
        className,
      )}
      {...props}
    >
      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50 mr-1" />
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className,
    )}
    {...props}
  >
    <div className="pb-1 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const TreeIcon = ({
  item,
  isOpen,
  isSelected,
  default: defaultIcon,
}: {
  item: TreeDataItem;
  isOpen?: boolean;
  isSelected?: boolean;
  default?: any;
}) => {
  let Icon = defaultIcon;
  if (isSelected && item.selectedIcon) {
    Icon = item.selectedIcon;
  } else if (isOpen && item.openIcon) {
    Icon = item.openIcon;
  } else if (item.icon) {
    Icon = item.icon;
  }
  return Icon ? <Icon className="h-4 w-4 shrink-0 mr-2" /> : <></>;
};

const TreeActions = ({
  children,
  isSelected,
}: {
  children: React.ReactNode;
  isSelected: boolean;
}) => {
  return (
    <div
      className={cn(
        isSelected ? "block" : "hidden",
        "absolute right-3 group-hover:block",
      )}
    >
      {children}
    </div>
  );
};

export { TreeView, type TreeDataItem };
