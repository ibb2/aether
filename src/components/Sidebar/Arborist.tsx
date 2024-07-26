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
} from "lucide-react";

const Node = ({ node, style, dragHandle, tree }) => {
  /* This node instance can do many things. See the API reference. */
  // console.log(node, tree);
  // console.log(node.level);
  return (
    <div className={cn("node-container")} style={style} ref={dragHandle}>
      <div
        className={cn(
          "node-content",
          "flex gap-x-2 items-center",
          node.level > 0 && "ml-6",
        )}
        onClick={() => node.isInternal && node.toggle()}
      >
        <div className="flex">
          {!node.isLeaf && node.level === 0 && (
            <>
              {node.isOpen ? <ChevronDown /> : <ChevronRight />}
              <NotebookTabs />
            </>
          )}
          {node.isLeaf && node.level > 0 && <File />}
          {!node.isLeaf && node.level > 0 && (
            <>{node.isOpen ? <FolderOpen /> : <FolderClosed />}</>
          )}
        </div>
        <p className={cn("node-text")}>
          <p>{node.data.name}</p>
        </p>
      </div>
    </div>
  );
};

export default Node;
