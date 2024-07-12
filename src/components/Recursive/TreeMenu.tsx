import { evolu } from "@/db/db";
import { notesQuery, sectionsQuery } from "@/db/queries";
import { NotebooksTable } from "@/db/schema";
import { useQueries, useQuery } from "@evolu/react";
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

interface TreeMenuProps {
  id: any;
  title: any;
  data: any;
  level: number;
}

const TreeMenu = ({ id, title, data, level }: TreeMenuProps) => {
  const [show, setShow] = React.useState(false);
  const [notes, sections] = useQueries([notesQuery, sectionsQuery]);

  const hasChildren = data.sections?.length > 0 || data.notes?.length > 0;

  const isSection = data.isSection === 1;
  const isNote = data.isNote === 1;

  const indentLevel = cn(isSection && "ml-8");

  return (
    <div className={indentLevel}>
      <div
        onClick={(e) => {
          setShow(!show);
          e.preventDefault();
        }}
        className="flex flex-row items-center px-3 py-2 rounded-lg hover:bg-muted w-full"
        key={id}
      >
        <div className="pr-1.5">
          {hasChildren &&
            (show ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </div>
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
            <ContextMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <SectionDialog notebookId={id}>
                <p className="w-full">New Section (folder)</p>
              </SectionDialog>
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <NoteDialog notebookId={id} notebookTitle={title!}>
                <p className="w-full">New Note</p>
              </NoteDialog>
              {/* New Note */}
            </ContextMenuItem>
            {/* <ContextMenuItem>Team</ContextMenuItem>
              <ContextMenuItem>Subscription</ContextMenuItem> */}
          </ContextMenuContent>
        </ContextMenu>
      </div>
      {show && (
        <>
          {data.sections?.map((section) => (
            <TreeMenu
              key={section.id}
              id={id}
              title={title}
              data={section}
              level={level + 1}
            />
          ))}
          {data.notes?.map((note) => (
            <div
              key={note.id}
              className="pl-8 px-4 rounded-md hover:bg-muted w-full"
            >
              <ContextMenu>
                <ContextMenuTrigger
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  asChild
                >
                  <div
                    // href="#"
                    className="items-center gap-3 pl-2 py-1 border-l-2 border-l-muted text-muted-foreground hover:text-primary hover:bg-muted w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {/* <Home className="h-4 w-4" /> */}
                    {note.title}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <p className="w-full">Rename</p>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <p className="w-full">Edit</p>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <p className="w-full">Delete</p>
                    {/* New Note */}
                  </ContextMenuItem>
                  {/* <ContextMenuItem>Team</ContextMenuItem>
                    <ContextMenuItem>Subscription</ContextMenuItem> */}
                </ContextMenuContent>
              </ContextMenu>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TreeMenu;
