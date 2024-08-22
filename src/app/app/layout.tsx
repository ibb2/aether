"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "@/db/db";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@tiptap/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import useSidebarStore from "@/store/sidebar";
import { ImperativePanelHandle } from "react-resizable-panels";
import useStateStore from "@/store/state";
import useResizeObserver from "use-resize-observer";

export default function AppLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  // Refs
  const menuContainerRef = React.useRef(null);
  const panelRef = React.useRef<ImperativePanelHandle>(null);

  // Const
  const MULTIPLE = 10.42553191;

  // State
  const [width, setWidth] = React.useState(
    panelRef.current?.getSize() ?? 20 * MULTIPLE,
  );

  // Store
  const { open, size, setOpen, adjustSize, setRef } = useSidebarStore(
    (state) => ({
      open: state.open,
      size: state.size,
      setOpen: state.setOpen,
      adjustSize: state.adjustSize,
      setRef: state.setRef,
    }),
  );

  const { editor, canvasRef, setCanvasRef, setEditor } = useStateStore(
    (state) => ({
      editor: state.editor,
      canvasRef: state.canvasRef,
      setCanvasRef: state.setRef,
      setEditor: state.setEditor,
    }),
  );

  React.useEffect(() => {
    setRef(panelRef);
  }, [panelRef, setRef]);

  return (
    <EvoluProvider value={evolu}>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex fixed h-full align-self self-start"
        ref={menuContainerRef}
      >
        {/* Include shared UI here e.g. a header or sidebar */}
        {open && (
          <ResizablePanel
            defaultSize={20}
            collapsible
            maxSize={50}
            onResize={(s) => {
              adjustSize(s);
              setWidth(s * MULTIPLE);
            }}
            ref={panelRef}
          >
            <Sidebar
              isOpen={open}
              onClose={setOpen}
              editor={editor!}
              canvasRef={canvasRef.current}
            />
          </ResizablePanel>
        )}
        <ResizableHandle withHandle />
        <ResizablePanel className="flex-1">
          <section className="h-full">{children}</section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </EvoluProvider>
  );
}
