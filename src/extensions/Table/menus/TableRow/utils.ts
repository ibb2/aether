import { Editor } from '@tiptap/react'
import { EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { isTableSelected } from '@/extensions/Table/utils'
import { Table } from '@tiptap/extension-table'

export const isRowGripSelected = ({
    editor,
    view,
    state,
    from,
}: {
    editor: Editor
    view: EditorView
    state: EditorState
    from: number
}) => {
    const domAtPos = view.domAtPos(from).node as HTMLElement
    const nodeDOM = view.nodeDOM(from) as HTMLElement
    const node = nodeDOM || domAtPos

    if (
        !editor.isActive(Table.name) ||
        !node ||
        isTableSelected(state.selection)
    ) {
        return false
    }

    let container = node

    while (container && !['TD', 'TH'].includes(container.tagName)) {
        container = container.parentElement!
    }

    const gripRow =
        container &&
        container.querySelector &&
        container.querySelector('a.grip-row.selected')

    return !!gripRow
}

export default isRowGripSelected
