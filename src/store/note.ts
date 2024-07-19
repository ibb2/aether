import { create } from "zustand";
import { Brand } from "effect/Brand";

interface NoteState {
  id: (string & Brand<"Id"> & Brand<"ExportedData">) | null;
  noteId: (string & Brand<"Id"> & Brand<"Note">) | null;
  name: string;
  data: {} | null;
  ink: any | null;
  setNote: (
    data: {},
    name: string,
    noteId: string & Brand<"Id"> & Brand<"Note">,
    id: string & Brand<"Id"> & Brand<"ExportedData">,
  ) => void;
  setInk: (data: any) => void;
}

const useNoteStore = create<NoteState>()((set) => ({
  name: "",
  id: null,
  noteId: null,
  data: null,
  ink: null,
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
}));

export default useNoteStore;
