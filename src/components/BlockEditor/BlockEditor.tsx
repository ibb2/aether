"use client";

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

export const BlockEditor = ({ ydoc, provider }: TiptapProps) => {
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);

  const { editor, users, characterCount, collabState, leftSidebar } =
    useBlockEditor({ ydoc, provider });

  const customEditor = useEditor({
    extensions: [
      ...ExtensionKit({
        provider,
      }),
    ],
    content: initialContent,
  });

  const displayedUsers = users.slice(0, 3);

  const providerValue = useMemo(() => {
    return {};
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex h-full" ref={menuContainerRef}>
        <Sidebar
          isOpen={leftSidebar.isOpen}
          onClose={leftSidebar.close}
          editor={editor}
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
    </EditorContext.Provider>
  );
};

export default BlockEditor;
