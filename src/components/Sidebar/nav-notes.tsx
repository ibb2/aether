'use client'

import * as React from 'react'
import { ChevronRight, File, Folder } from 'lucide-react'

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
} from '@/components/ui/sidebar'

import * as S from '@effect/schema/Schema'

import { cn } from '@/lib/utils'
import {
    NonEmptyString1000,
    useEvolu,
    useQueries,
    useQuery,
} from '@evolu/react'
import {
    fragmentsQuery,
    notebooksQuery,
    notesQuery,
    sectionsQuery,
} from '@/db/queries'

import { Database, evolu } from '@/db/db'
import { NonEmptyString50, NoteId, SectionId } from '@/db/schema'
import { initialContent } from '@/lib/data/initialContent'
import useNoteStore from '@/store/note'
import { useRouter } from 'next/navigation'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
import NotesContextMenu from '../dialogs/notes/context-menu'
import { Editor, useCurrentEditor } from '@tiptap/react'
import { ReactSketchCanvasRef } from 'react-sketch-canvas'
import useSidebarStore from '@/store/sidebar'
import useEditorStore from '@/store/editor'
import { processImages } from '@/lib/processImages'

function searchTree(items: TreeDataItem[], query: string): TreeDataItem[] {
    return (
        items
            .map((item) => {
                // Search within children only if they exist
                const matchingChildren = item.children
                    ? searchTree(item.children, query)
                    : []

                // Match the current item if its name contains the query, or if it has matching children
                if (
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    matchingChildren.length > 0
                ) {
                    // If the item has children, return them; otherwise, return the item without adding `children`
                    return item.children
                        ? { ...item, children: matchingChildren }
                        : { ...item }
                }

                return null
            })
            // Filter out items that do not match the search
            .filter((item) => item !== null) as TreeDataItem[]
    )
}

export default function NavNotes({
    canvasRef,
}: {
    canvasRef: React.RefObject<ReactSketchCanvasRef>
}) {
    const router = useRouter()

    const editor = useEditorStore((s) => s.editor)
    const setNoteId = useNoteStore((s) => s.setNoteId)
    const setId = useNoteStore((s) => s.setId)

    const [notebooks, sections, notes] = useQueries([
        notebooksQuery,
        sectionsQuery,
        notesQuery,
    ])

    // State
    const [initialTreeData, setInitialTreeData] = React.useState<any>()
    const [treeData, setTreeData] = React.useState<any>()

    // Make treeview data
    const convertToTreeStructure = (data) => {
        const allItems = [...data.notebooks, ...data.sections, ...data.notes]

        const findChildren = (parentId, notebookId) => {
            return allItems.filter((item) => {
                if (item.type === 'note') {
                    return (
                        item.sectionId === parentId ||
                        (item.notebookId === parentId && !item.sectionId)
                    )
                } else {
                    return (
                        item.parentId === parentId ||
                        (item.notebookId === notebookId && !item.parentId)
                    )
                }
            })
        }

        const processItem = (item) => {
            const children = findChildren(item.id, item.id).map(processItem)
            const result = {
                id: item.id,
                name: item.name || item.title || '[Unnamed]',
                type: item.type,
                notebookId: item.notebookId,
                parentId: item.parentId,
            }
            if (item.type !== 'note') {
                result.children = children
            }
            return result
        }

        // Process only notebooks at the top level
        const tree = data.notebooks.map(processItem)

        return tree
    }

    const transformData = (notebooks, sections, notes) => {
        const normalizedData = {
            notebooks: notebooks.rows.map((notebook) => ({
                id: notebook.id,
                name: notebook.title,
                type: 'notebook',
            })),
            sections: sections.rows.map((section) => ({
                id: section.id,
                name: section.title,
                type: 'section',
                notebookId: section.notebookId,
                parentId: section.parentId,
            })),
            notes: notes.rows.map((note) => ({
                id: note.id,
                name: note.title,
                type: 'note',
                notebookId: note.notebookId,
                sectionId: note.sectionId,
            })),
        }

        return normalizedData
    }

    React.useEffect(() => {
        const getData = async () => {
            const transformedData = transformData(notebooks, sections, notes)
            const treeStructure = convertToTreeStructure(transformedData)
            setTreeData(treeStructure)
            setInitialTreeData(treeStructure)
        }

        getData()
    }, [notebooks, sections, notes])

    const { update } = useEvolu<Database>()

    const setNote = useNoteStore((state) => state.setNote)

    const exportedDataQuery = React.useCallback(() => {
        return evolu.createQuery((db) =>
            db
                .selectFrom('exportedData')
                .select('id')
                .select('jsonData')
                .select('noteId')
                .select('inkData')
        )
    }, [])

    // Use the query result here
    const exportedData = useQuery(exportedDataQuery())

    const selectNote = (item: any, editor: Editor) => {
        setNote(item)
        setTreeData(initialTreeData)

        // Update the editor's content directly
        const data = exportedData.rows.find(
            (row) => row.noteId === S.decodeSync(NoteId)(item.id)
        )

        if (data) {
            const inkData = Array.isArray(data.inkData)
                ? (data.inkData as unknown as import('react-sketch-canvas').CanvasPath[])
                : null

            if (canvasRef.current) {
                canvasRef.current.resetCanvas()
                if (inkData) {
                    canvasRef.current.loadPaths(inkData)
                }
                editor.commands.setContent(data.jsonData!)
            } else {
                editor.commands.setContent(data.jsonData!)
            }
            setTimeout(() => processImages(editor), 0)
            setId(data.id)
            setNoteId(data.noteId!)
        }
    }

    const deleteNode = (item) => {
        if (item.type === 'section') {
            update('sections', {
                id: S.decodeSync(SectionId)(item.id),
                isDeleted: true,
            })
        }
    }

    const deleteNote = (item) => {
        update('notes', {
            id: S.decodeSync(NoteId)(item.id),
            isDeleted: true,
        })
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Notes</SidebarGroupLabel>
            <SidebarMenu>
                {treeData !== undefined && (
                    <>
                        {treeData.map((item) => (
                            <Tree
                                key={item.id}
                                item={item}
                                selectNote={(item) => selectNote(item, editor)}
                                deleteNode={deleteNode}
                                deleteNote={deleteNote}
                                editor={editor!}
                            />
                        ))}
                    </>
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function Tree({
    item,
    selectNote,
    deleteNode,
    deleteNote,
    editor,
}: {
    item: any
    selectNote: (item: any) => void
    deleteNode: (item: any) => void
    deleteNote: (item: any) => void
    editor: Editor
}) {
    const [dialogType, setDialogType] = React.useState<string>('')
    const [openDialog, setOpenDialog] = React.useState<boolean>(false)

    if (item.type === 'note') {
        return (
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <SidebarMenuButton
                        // isActive={name === 'button.tsx'}
                        onClick={() => selectNote(item)}
                        className="data-[active=true]:bg-transparent"
                    >
                        <File />
                        {item.name}
                    </SidebarMenuButton>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuGroup>
                        <ContextMenuItem
                            onSelect={(e) => {
                                setDialogType('rename')
                                setOpenDialog(true)
                                e.preventDefault()
                            }}
                        >
                            <span>Rename</span>
                        </ContextMenuItem>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuGroup>
                        <ContextMenuItem onSelect={() => deleteNote(item)}>
                            <span>Delete</span>
                        </ContextMenuItem>
                    </ContextMenuGroup>
                    <NotesContextMenu
                        type={dialogType}
                        open={openDialog}
                        setOpen={setOpenDialog}
                        item={item}
                    />
                </ContextMenuContent>
            </ContextMenu>
        )
    }

    return (
        <ContextMenu>
            <SidebarMenuItem>
                <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
                    <CollapsibleTrigger asChild>
                        <ContextMenuTrigger asChild>
                            <SidebarMenuButton>
                                <ChevronRight className="transition-transform" />
                                <Folder />
                                {item.name}
                            </SidebarMenuButton>
                        </ContextMenuTrigger>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        {item.children !== undefined && (
                            <SidebarMenuSub>
                                {item.children.length > 0 && (
                                    <>
                                        {item.children.map((note) => (
                                            <Tree
                                                key={note.id}
                                                item={note}
                                                selectNote={(item) =>
                                                    selectNote(item, editor)
                                                }
                                                deleteNode={deleteNode}
                                                deleteNote={deleteNote}
                                            />
                                        ))}
                                    </>
                                )}
                            </SidebarMenuSub>
                        )}
                    </CollapsibleContent>
                </Collapsible>
                <ContextMenuContent>
                    <ContextMenuGroup>
                        <ContextMenuItem
                            onSelect={(e) => {
                                setDialogType('rename')
                                setOpenDialog(true)
                                e.preventDefault()
                            }}
                        >
                            <span>Rename</span>
                        </ContextMenuItem>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onSelect={(e) => {
                            setDialogType('section')
                            setOpenDialog(true)
                            e.preventDefault()
                        }}
                    >
                        <span>New Section</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                        onSelect={(e) => {
                            setDialogType('note')
                            setOpenDialog(true)
                            e.preventDefault()
                        }}
                    >
                        <span>New Note</span>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onSelect={(e) => deleteNode(item)}>
                        <span>Delete</span>
                    </ContextMenuItem>
                    <NotesContextMenu
                        type={dialogType}
                        open={openDialog}
                        setOpen={setOpenDialog}
                        item={item}
                    />
                </ContextMenuContent>
            </SidebarMenuItem>
        </ContextMenu>
    )
}
