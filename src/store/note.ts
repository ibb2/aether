import { create } from 'zustand'
import { Brand } from 'effect/Brand'

interface NoteState {
    id: (string & Brand<'Id'> & Brand<'ExportedData'>) | null
    noteId: (string & Brand<'Id'> & Brand<'Note'>) | null
    name: string
    data: {} | null
    ink: any | null
    isInkEnabled: boolean
    isPageSplit: boolean
    item: any
    setNote: (item: any) => void
    setId: (id: any) => void
    setNoteId: (id: any) => void
    setInk: (data: any) => void
    setInkStatus: () => void
    setPageSplit: () => void
}

const useNoteStore = create<NoteState>()((set) => ({
    name: '',
    id: null,
    noteId: null,
    data: null,
    ink: null,
    isInkEnabled: false,
    isPageSplit: false,
    item: null,

    setNote: (item) => set(() => ({ item })),
    setId: (id) => set(() => ({ id })),
    setNoteId: (id) => set(() => ({ noteId: id })),
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
}))

export default useNoteStore
