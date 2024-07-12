import { create } from "zustand";
import { Brand } from "effect/Brand";

interface NoteDialogState {
  isOpen: boolean;
  toggle: () => void;
}

const useNoteDialogStore = create<NoteDialogState>()((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useNoteDialogStore;
