import React from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { create } from "zustand";

interface SidebarState {
  open: boolean;
  ref: React.RefObject<ImperativePanelHandle>;
  size: number;
  setOpen: () => void;
  adjustSize: (size: number) => void;
  setRef: (ref: any) => void;
}

const useSidebarStore = create<SidebarState>()((set) => ({
  open: true,
  ref: React.createRef(),
  size: 25,
  setOpen: () => set((state) => ({ open: !state.open })),
  adjustSize: (size: number) => set((state) => ({ size: size })),
  setRef: (ref: any) => set({ ref }),
}));

export default useSidebarStore;
