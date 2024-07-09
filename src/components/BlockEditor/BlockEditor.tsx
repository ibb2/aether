"use client";

import * as S from "@effect/schema/Schema";

import { EditorContent, PureEditorContent, useEditor } from "@tiptap/react";
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
import { useEvolu } from "@evolu/react";
import type { Database } from "@/db/db";
import useNoteStore from "@/store/note";
import { NonEmptyString50 } from "@/db/schema";
import { useDebounce } from "use-debounce";

export const BlockEditor = ({ ydoc, provider }: TiptapProps) => {
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);

  // Evolu
  const { create, createOrUpdate } = useEvolu<Database>();

  // NoteStore zustand
  const { id, name, noteId, data, setNote } = useNoteStore((state) => ({
    id: state.id!,
    name: state.name,
    noteId: state.noteId!,
    data: state.data,
    setNote: state.setNote,
  }));

  const { editor, users, characterCount, collabState, leftSidebar } =
    useBlockEditor({ ydoc, provider });

  const customEditor = useEditor({
    extensions: [
      ...ExtensionKit({
        provider,
      }),
    ],
    content: data,
    onBeforeCreate({ editor }) {
      // Before the view is created.
    },
    onCreate({ editor }) {
      // The editor is ready.
    },
    onUpdate({ editor }) {
      // The content has changed.
      // Content does not seem to be the content of the editor

      const { id: updatedExportedData } = createOrUpdate("exportedData", {
        id,
        noteId,
        jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${id}`),
        jsonData: editor.getJSON(),
      });

      console.log("Updated document: ", updatedExportedData);
    },
    onSelectionUpdate({ editor }) {
      // The selection has changed.

      console.log("Selection");
    },
    onTransaction({ editor, transaction }) {
      // The editor state has changed.
      console.log("Transaction", transaction);
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

  const debounceEditor = useDebounce(customEditor?.state.doc.content, 2000);

  React.useEffect(() => {
    if (debounceEditor && customEditor !== null) {
      const { id: updatedExportedData } = createOrUpdate("exportedData", {
        id,
        noteId,
        jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${id}`),
        jsonData: customEditor.getJSON(),
      });
      console.info("Saved the data ", updatedExportedData);
    }
  }, [
    provider,
    data,
    debounceEditor,
    customEditor,
    createOrUpdate,
    id,
    noteId,
  ]);

  const displayedUsers = users.slice(0, 3);

  const providerValue = useMemo(() => {
    return {};
  }, []);

  if (!editor) {
    return null;
  }

  function Editor() {
    console.log("log on every editor change");

    const editor = useEditor({
      extensions: [StarterKit],
      content: "<p>Hello World!</p>",
    });

    return <EditorContent editor={editor} />;
  }

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar
        isOpen={leftSidebar.isOpen}
        onClose={leftSidebar.close}
        editor={customEditor!}
      />
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        <EditorHeader
          characters={characterCount.characters()}
          // collabState={collabState}
          // users={displayedUsers}
          words={characterCount.words()}
          isSidebarOpen={leftSidebar.isOpen}
          toggleSidebar={leftSidebar.toggle}
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
      </div>
    </div>
  );
};

export default BlockEditor;
