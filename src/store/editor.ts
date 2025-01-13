import { Editor } from '@tiptap/core'
import { create } from 'zustand'

interface EditorState {
    editor: Editor | null
    setEditor: (editor: Editor | null) => void
}

const useEditorStore = create<EditorState>((set) => ({
    editor: null,
    setEditor: (editor) =>
        set({
            editor: editor,
        }),
}))

export default useEditorStore
