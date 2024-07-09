import { evolu } from "@/db/db";
import { NoteId } from "@/db/schema";
import * as S from "@effect/schema/Schema";
import { useQuery } from "@evolu/react";
import { create } from "zustand";
import { Brand } from "effect/Brand";

interface NoteState {
  id: (string & Brand<"Id"> & Brand<"Note">) | null;
  name: string;
  data: {} | null;
  setNote: (
    data: {},
    name: string,
    id: string & Brand<"Id"> & Brand<"Note">,
  ) => void;
}

const useNoteStore = create<NoteState>()((set) => ({
  name: "",
  id: null,
  data: null,
  setNote: (data: {}, name: string, id: string & Brand<"Id"> & Brand<"Note">) =>
    set(() => ({ data, name, id })),
}));

export default useNoteStore;
