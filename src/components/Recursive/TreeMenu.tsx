import { evolu } from "@/db/db";
import { notesQuery } from "@/db/queries";
import { NotebooksTable } from "@/db/schema";
import { useQuery } from "@evolu/react";
import Link from "next/link";

const TreeMenu = ({ data, id }) => {
  const { rows: notes } = useQuery(notesQuery);

  return (
    <div className="pl-4">
      {data.rows.map((parent) => {
        return (
          <div key={parent.title}>
            <Link
              href="#"
              className="items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              key={parent.id}
            >
              {/* <Home className="h-4 w-4" /> */}
              {parent.name}
            </Link>
            {/* {parent.isFolder && <button>{parent.name}</button>}
            {!parent.isFolder && <span>{parent.name}</span>}
            <div>
              {parent.children && <RecursiveComponent data={parent.children} />}
            </div> */}
          </div>
        );
      })}
    </div>
  );
};

export default TreeMenu;
