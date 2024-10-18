import { create } from "zustand";
import { Brand } from "effect/Brand";

interface NoteState {
  id: (string & Brand<"Id"> & Brand<"ExportedData">) | null;
  noteId: (string & Brand<"Id"> & Brand<"Note">) | null;
  name: string;
  data: {} | null;
  ink: any | null;
  isInkEnabled: boolean;
  isPageSplit: boolean;
  noteItem: any;
  setNote: (
    data: {},
    name: string,
    noteId: string & Brand<"Id"> & Brand<"Note">,
    id: string & Brand<"Id"> & Brand<"ExportedData">,
    items: any,
  ) => void;
  setInk: (data: any) => void;
  setInkStatus: () => void;
  setPageSplit: () => void;
}

const useNoteStore = create<NoteState>()((set) => ({
  name: "",
  id: null,
  noteId: null,
  data: null,
  ink: null,
  isInkEnabled: false,
  isPageSplit: false,
  noteItem: null,

  setNote: (
    data: {},
    name: string,
    noteId: string & Brand<"Id"> & Brand<"Note">,
    id: string & Brand<"Id"> & Brand<"ExportedData">,
    noteItem?: any,
  ) => set(() => ({ data, name, noteId, id, noteItem })),
  setInk: (data: any) =>
    set(() => ({
      ink: data,
    })),
  setInkStatus: () =>
    set((state) => ({
      isInkEnabled: !state.isInkEnabled,
    })),
  setPageSplit: () =>
    set((state) => ({
      isPageSplit: !state.isPageSplit,
    })),
}));

export default useNoteStore;
