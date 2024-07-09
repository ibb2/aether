import { create } from "zustand";
import { Brand } from "effect/Brand";

interface NoteState {
  id: (string & Brand<"Id"> & Brand<"ExportedData">) | null;
  noteId: (string & Brand<"Id"> & Brand<"Note">) | null;
  name: string;
  data: {} | null;
  setNote: (
    data: {},
    name: string,
    noteId: string & Brand<"Id"> & Brand<"Note">,
    id: string & Brand<"Id"> & Brand<"ExportedData">,
  ) => void;
}

const useNoteStore = create<NoteState>()((set) => ({
  name: "",
  id: null,
  noteId: null,
  data: null,
  setNote: (
    data: {},
    name: string,
    noteId: string & Brand<"Id"> & Brand<"Note">,
    id: string & Brand<"Id"> & Brand<"ExportedData">,
  ) => set(() => ({ data, name, noteId, id })),
}));

export default useNoteStore;
