import { create } from "zustand";
import { Brand } from "effect/Brand";
import { ReactSketchCanvasRef } from "react-sketch-canvas";
import { Editor } from "@tiptap/react";
import React from "react";

interface State {
  editor: Editor | null;
  canvasRef: React.RefObject<ReactSketchCanvasRef>;
  setRef: (ref: any) => void;
  setEditor: (editor: Editor) => void;
}

const useStateStore = create<State>()((set) => ({
  editor: null,
  canvasRef: React.createRef(),
  setRef: (ref: any) => set({ canvasRef: ref }),
  setEditor: (editor: Editor) => set({ editor }),
}));

export default useStateStore;
