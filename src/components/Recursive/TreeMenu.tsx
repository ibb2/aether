import { evolu } from "@/db/db";
import { notesQuery, sectionsQuery } from "@/db/queries";
import { NotebooksTable } from "@/db/schema";
import { useQueries, useQuery } from "@evolu/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface TreeMenuProps {
  data: any;
  level: number;
}

const TreeMenu = ({ data, level }: TreeMenuProps) => {
  const [show, setShow] = React.useState(false);
  const [notes, sections] = useQueries([notesQuery, sectionsQuery]);

  const hasChildren = data.sections?.length > 0 || data.notes?.length > 0;
  console.log("Data", data);
  console.log(level);

  const indentLevel = "ml-4";

  return (
    <div className="ml-4">
      <div onClick={() => setShow(!show)} className="flex flex-row">
        {hasChildren &&
          (show ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        <span className="ml-1">{data.title}</span>
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
            <TreeMenu key={section.id} data={section} level={level + 1} />
          ))}
          {data.notes?.map((note) => (
            <div key={note.id} className="ml-8">
              {note.title}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TreeMenu;
