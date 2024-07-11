import { evolu } from "@/db/db";
import { notesQuery, sectionsQuery } from "@/db/queries";
import { NotebooksTable } from "@/db/schema";
import { useQueries, useQuery } from "@evolu/react";
import Link from "next/link";

interface TreeMenuProps {
  data: any;
  id: any;
}

const TreeMenu = ({ data, id }: TreeMenuProps) => {
  const [notes, sections] = useQueries([notesQuery, sectionsQuery]);

  return (
    <div className="pl-4 my-4">
      {data.rows.map((parent: any) => {
        return (
          <div key={parent.title}>
            {/* <Link
              href="#"
              className="items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              key={parent.id}
            >
              {parent.title}
            </Link> */}
            <div
              className="items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              key={parent.id}
            >
              {/* <Home className="h-4 w-4" /> */}
              {parent.title}
            </div>
            {parent.isFolder && <button>{parent.name}</button>}
            {parent.isNote && <span>{parent.name}</span>}
            <div>{parent.isFolder && <TreeMenu data={notes} id={id} />}</div>
          </div>
        );
      })}
    </div>
  );
};

export default TreeMenu;
