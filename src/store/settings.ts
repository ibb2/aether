import { create } from "zustand";
import { Brand } from "effect/Brand";

interface SettingsPageStore {
  id: (string & Brand<"Id"> & Brand<"ExportedData">) | null;
  noteId: (string & Brand<"Id"> & Brand<"Note">) | null;
  name: string;
  data: {} | null;
  ink: any | null;
  isInkEnabled: boolean;
  isPageSplit: boolean;
  setNote: (
    data: {},
    name: string,
    noteId: string & Brand<"Id"> & Brand<"Note">,
    id: string & Brand<"Id"> & Brand<"ExportedData">,
  ) => void;
  setInk: (data: any) => void;
  setInkStatus: () => void;
  setPageSplit: () => void;
}

const useSettingsPageStore = create<SettingsPageStore>()((set) => ({
  name: "",
  route: "",
  id: null,
  noteId: null,
  data: null,
  ink: null,
  isInkEnabled: false,
  isPageSplit: false,
  setNote: (
    data: {},
    name: string,
    noteId: string & Brand<"Id"> & Brand<"Note">,
    id: string & Brand<"Id"> & Brand<"ExportedData">,
  ) => set(() => ({ data, name, noteId, id })),
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

export default useSettingsPageStore;
