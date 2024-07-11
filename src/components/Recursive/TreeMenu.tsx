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
  console.log("Data", data);
  console.log(level);

  const isSection = data.isSection === 1;
  const isNote = data.isNote === 1;

  console.log("section", isSection);
  console.log("note", isNote);

  const indentLevel = cn(isSection && "ml-8");

  return (
    <div className={indentLevel}>
      <div onClick={() => setShow(!show)} className="flex flex-row">
        {hasChildren &&
          (show ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
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
              className="items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
              }}
            >
              <SectionDialog notebookId={data.id}>
                <p className="w-full">New Section (folder)</p>
              </SectionDialog>
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <NoteDialog notebookId={data.id} notebookTitle={data.title!}>
                <p className="w-full">New Note</p>
              </NoteDialog>
              {/* New Note */}
            </ContextMenuItem>
            {/* <ContextMenuItem>Team</ContextMenuItem>
              <ContextMenuItem>Subscription</ContextMenuItem> */}
          </ContextMenuContent>
        </ContextMenu>
      </div>
      {/* <Link
          href="#"
          className="items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          key={parent.id}
        >
          {parent.title}
        </Link> */}
      {/* <div
        className="items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
        key={parent.id}
      > */}
      {/* <Home className="h-4 w-4" /> */}
      {/* {parent.title}
      </div> */}
      {/* {parent.isSection && <button>{parent.title}</button>} */}
      {/* {parent.isNote && <span>{parent.title}</span>} */}
      {/* <div>{hasChildren && <TreeMenu data={data} level={level + 1} />}</div> */}
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
            <div key={note.id} className="ml-12">
              {note.title}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TreeMenu;
