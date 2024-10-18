import { create } from 'zustand'
import { Brand } from 'effect/Brand'
import { TreeDataItem } from '@/components/tree-view'

interface NoteState {
    id: (string & Brand<'Id'> & Brand<'ExportedData'>) | null
    noteId: (string & Brand<'Id'> & Brand<'Note'>) | null
    name: string
    data: {} | null
    ink: any | null
    isInkEnabled: boolean
    isPageSplit: boolean
    item: TreeDataItem | null
    setNote: (item: TreeDataItem | null) => void
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
