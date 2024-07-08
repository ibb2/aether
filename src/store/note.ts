import { evolu } from "@/db/db";
import { NoteId } from "@/db/schema";
import * as S from "@effect/schema/Schema";
import { useQuery } from "@evolu/react";
import { create } from "zustand";

interface NoteState {
  name: string;
  data: Array<any> | null;
}

const useNoteStore = create<NoteState>()((set) => ({
  name: "",
  data: null,
  setNote: (data: Array<any>, name: string) => set(() => ({ data, name })),
}));

export default useNoteStore;
