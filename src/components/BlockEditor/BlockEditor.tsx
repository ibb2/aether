"use client";

import * as S from "@effect/schema/Schema";

import { EditorContent, PureEditorContent, useEditor } from "@tiptap/react";
import { Editor } from "@tiptap/core";
import React, { useMemo, useRef } from "react";

import { LinkMenu } from "@/components/menus";

import { useBlockEditor } from "@/hooks/useBlockEditor";

import "@/styles/index.css";

import { Sidebar } from "@/components/Sidebar";
import { EditorContext } from "@/context/EditorContext";
import ImageBlockMenu from "@/extensions/ImageBlock/components/ImageBlockMenu";
import { ColumnsMenu } from "@/extensions/MultiColumn/menus";
import { TableColumnMenu, TableRowMenu } from "@/extensions/Table/menus";
import { TiptapProps } from "./types";
import { EditorHeader } from "./components/EditorHeader";
import { TextMenu } from "../menus/TextMenu";
import { ContentItemMenu } from "../menus/ContentItemMenu";
import { initialContent } from "@/lib/data/initialContent";
import { blankContent } from "@/lib/data/blankContent";
import ExtensionKit from "@/extensions/extension-kit";
import { useEvolu, useQuery } from "@evolu/react";
import { evolu, type Database } from "@/db/db";
import useNoteStore from "@/store/note";
import {
  CanvasPathArray,
  CanvasPathSchema,
  NonEmptyString50,
} from "@/db/schema";
import { useDebounce, useDebouncedCallback } from "use-debounce";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

export const BlockEditor = ({ ydoc, provider }: TiptapProps) => {
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);
  const canvasRef = React.useRef<ReactSketchCanvasRef>(null);

  // State
  const [lastSaveTime, setLastSaveTime] = React.useState(Date.now());
  const [lastInkedSaveTime, setLastInkedSaveTime] = React.useState(0);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [readOnly, setReadOnly] = React.useState(false);
  const [load, onLoad] = React.useState(0);

  // Evolu
  const { create, createOrUpdate, update } = useEvolu<Database>();

  // NoteStore zustand
  const { id, name, noteId, data, ink, setNote } = useNoteStore((state) => ({
    id: state.id!,
    name: state.name,
    noteId: state.noteId!,
    data: state.data,
    ink: state.ink,
    setNote: state.setNote,
  }));

  const { users, characterCount, collabState } = useBlockEditor({
    ydoc,
    provider,
  });

  const leftSidebar = useSidebar();

  const exportedDataQuery = evolu.createQuery((db) =>
    db
      .selectFrom("exportedData")
      .where("id", "=", id)
      .select("id")
      .select("jsonData")
      .select("noteId")
      .select("inkData"),
  );

  // Use the query result here
  const { rows: exportedDataRows } = useQuery(exportedDataQuery);

  // Get initial data
  const getInitialData = async (editor: Editor) => {
    console.log("initial data");
    const { id, jsonData, noteId, inkData } = exportedDataRows[0];
    setNote(jsonData!, name, noteId!, id);
    editor.commands.setContent(jsonData!);
    console.log("Retrieved ink ");
    // await canvasRef.current?.loadPaths(inkData!);
  };

  const saveData = React.useCallback(
    (editor: any) => {
      if (editor) {
        const updatedData = editor.getJSON();
        update("exportedData", {
          id,
          noteId,
          jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${id}`),
          jsonData: updatedData,
        });
        console.info("Debouncing...");
        setLastSaveTime(Date.now());
      }
    },
    [id, noteId, update],
  );

  const transformCanvasPaths = (data): CanvasPathSchema[] => {
    return data.map((path) => ({
      drawMode: path.drawMode ?? false,
      startTimestamp: path.startTimestamp ?? 0,
      endTimestamp: path.endTimestamp ?? 0,
      paths: path.paths.map((p) => ({ x: p.x, y: p.y })) ?? [],
      strokeColor: path.strokeColor ?? "",
      strokeWidth: path.strokeWidth ?? 1,
    }));
  };

  const saveInkData = React.useCallback(
    async (canvasRef: ReactSketchCanvasRef) => {
      if (canvasRef === null) {
        return;
      }

      const prevTime = lastInkedSaveTime;
      const time = await canvasRef.getSketchingTime();
      const data = await canvasRef.exportPaths();

      const cleanedData = transformCanvasPaths(data);

      update("exportedData", {
        id,
        noteId,
        inkData: S.decodeSync(CanvasPathArray)(cleanedData),
      });
      setLastInkedSaveTime(time);
      console.log(data);
    },
    [id, lastInkedSaveTime, noteId, update],
  );

  const debouncedSave = useDebouncedCallback(saveData, 2000);
  const debouncedInkSave = useDebouncedCallback(saveInkData, 1000);

  // const loadData = () => {
  //   const { id } = exportedDataQuery;
  // };

  React.useEffect(() => {
    if (load === 0) {
      // getInitialData(editor);
      canvasRef.current?.loadPaths(ink);
      onLoad(1);
      console.log("Loaded... ", load);
    }
    if (canvasRef.current) debouncedInkSave(canvasRef.current);
  }, [debouncedInkSave, load]);

  const customEditor = useEditor({
    extensions: [
      ...ExtensionKit({
        provider,
      }),
    ],
    content: data,
    onBeforeCreate({ editor }) {
      // Before the view is created.
      console.log("Hey?");
    },
    onCreate({ editor }) {
      // The editor is ready.

      if (exportedDataRows[0] !== undefined) getInitialData(editor);
    },
    onUpdate({ editor }) {
      // The content has changed.
      // Content does not seem to be the content of the editor
      // Update as of 9/7/2024 it seems that yes infact this works as expected?
      // Unsure of the issue that caused it to fail.

      if (debouncedSave) {
        debouncedSave(editor);
      }
    },
    onSelectionUpdate({ editor }) {
      // The selection has changed.
      // console.log("Selection");
    },
    onTransaction({ editor, transaction }) {
      // The editor state has changed.
      // console.log("Transaction", transaction);
    },
    onFocus({ editor, event }) {
      // The editor is focused.
    },
    onBlur({ editor, event }) {
      // The editor isn’t focused anymore.
    },
    onDestroy() {
      // The editor is being destroyed.
    },
  });

  const displayedUsers = users.slice(0, 3);

  const providerValue = useMemo(() => {
    return {};
  }, []);

  if (!editor) {
    return null;
  }

  const windowClassName = cn(
    // "bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full w-0 duration-300 transition-all",
    // "dark:bg-black lg:dark:bg-black/30",
    "min-h-svh",
    // !leftSidebar.isOpen && "border-r-transparent",
    // leftSidebar.isOpen &&
    //   "w-80 border-r border-r-neutral-200 dark:border-r-neutral-800",
  );

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex h-full align-self self-start"
      ref={menuContainerRef}
    >
      {leftSidebar.isOpen && (
        <ResizablePanel defaultSize={20} className={windowClassName}>
          <Sidebar
            isOpen={leftSidebar.isOpen}
            onClose={leftSidebar.close}
            editor={customEditor!}
            canvasRef={canvasRef.current}
          />
        </ResizablePanel>
      )}
      {leftSidebar.isOpen && (
        <ResizableHandle withHandle className="min-h-svh" />
      )}
      <ResizablePanel className="relative flex flex-col flex-1 overflow-hidden">
        <ReactSketchCanvas
          ref={canvasRef}
          readOnly={readOnly}
          width="100%"
          height={"100%"}
          canvasColor="transparent"
          strokeColor="#fff"
          className="absolute z-[1]"
          onChange={() => {
            // Save function in here, handles all points.
            if (canvasRef.current) {
              console.log("Updating...");
              debouncedInkSave(canvasRef.current);
            }
          }}
          withTimestamp
        />
        <EditorHeader
          characters={characterCount.characters()}
          // collabState={collabState}
          // users={displayedUsers}
          words={characterCount.words()}
          isSidebarOpen={sidebarOpen}
          toggleSidebar={leftSidebar.toggle}
          canvasRef={canvasRef.current}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
        <EditorContent
          editor={customEditor}
          ref={editorRef}
          className="flex-1 overflow-y-auto"
        />
        <ContentItemMenu editor={customEditor!} />
        <LinkMenu editor={customEditor!} appendTo={menuContainerRef} />
        <TextMenu editor={customEditor!} />
        <ColumnsMenu editor={customEditor!} appendTo={menuContainerRef} />
        <TableRowMenu editor={customEditor!} appendTo={menuContainerRef} />
        <TableColumnMenu editor={customEditor!} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={customEditor!} appendTo={menuContainerRef} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default BlockEditor;
