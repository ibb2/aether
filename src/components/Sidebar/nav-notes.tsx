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

import { Database } from '@/db/db'
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

export default function NavNotes() {
    const router = useRouter()

    const [notebooks, sections, notes] = useQueries([
        notebooksQuery,
        sectionsQuery,
        notesQuery,
    ])

    const { rows: fragments } = useQuery(fragmentsQuery)

    // State
    const [initialTreeData, setInitialTreeData] = React.useState<any>()
    const [treeData, setTreeData] = React.useState<any>()
    const [query, setQuery] = React.useState('')
    const [fragmentsData, setFragmentsData] = React.useState<any>()

    // Make treeview data
    const convertToTreeStructure = (data) => {
        const allItems = [...data.notebooks, ...data.sections, ...data.notes]
        const itemMap = new Map(
            allItems.map((item) => [item.id, { ...item, children: [] }])
        )

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

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        setTreeData(searchTree(treeData, query))
        if (value.length === 0) setTreeData(initialTreeData)
    }

    React.useEffect(() => {
        const getData = async () => {
            const transformedData = transformData(notebooks, sections, notes)
            const treeStructure = convertToTreeStructure(transformedData)
            setTreeData(treeStructure)
            setInitialTreeData(treeStructure)
        }

        const getFragmentsData = async () => {
            const arr = []

            for (let i = 0; i < fragments.length; i++) {
                arr.push({
                    id: fragments[i].id,
                    name: S.decodeSync(S.String)(fragments[i].title!),
                    type: 'fragment',
                })
            }

            setFragmentsData([...arr])
        }

        getFragmentsData()
        getData()
    }, [notebooks, sections, notes, fragments])

    const [notebookName, setNotebookName] = React.useState('')
    const [notebookOpen, onNotebookOpen] = React.useState(false)

    const [fragmentName, setFragmentName] = React.useState('')
    const [fragmentOpen, onFragmentOpen] = React.useState(false)

    const { create, update } = useEvolu<Database>()

    const handler = () => {
        create('notebooks', {
            title: S.decodeSync(NonEmptyString1000)(notebookName),
        })
    }

    const createNoteFragment = () => {
        const { id } = create('notes', {
            title: S.decodeSync(NonEmptyString1000)(fragmentName),
            isFragment: true,
        })

        create('exportedData', {
            noteId: id,
            jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${id}`),
            jsonData: initialContent,
        })
    }

    const setNote = useNoteStore((state) => state.setNote)

    const selectNote = (item: any) => {
        setNote(item)
        setTreeData(initialTreeData)
        setQuery('')
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

    const windowClassName = cn(
        'bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full w-0 duration-300 transition-all',
        'dark:bg-black lg:dark:bg-black/30',
        'min-h-svh',
        'w-full'
        // !isOpen && "border-r-transparent",
        // isOpen && "w-full",
    )

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
                                selectNote={selectNote}
                                deleteNode={deleteNode}
                                deleteNote={deleteNote}
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
}: {
    item: any
    selectNote: (item: any) => void
    deleteNode: (item: any) => void
    deleteNote: (item: any) => void
}) {
    const [dialogType, setDialogType] = React.useState<string>('')

    const { update } = useEvolu<Database>()
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
                <Collapsible
                    className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                    // defaultOpen={name === 'components' || name === 'ui'}
                >
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
                                                selectNote={selectNote}
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

// function NotesContextMenu({ type }: { type: string }) {
//     return (
//         <ContextMenuContent>
//             <ContextMenuGroup>
//                 <ContextMenuItem
//                     onSelect={(e) => {
//                         setDialogType('rename')
//                         e.preventDefault()
//                         console.log('notebook and section ', item)
//                     }}
//                 >
//                     <span>Rename</span>
//                 </ContextMenuItem>
//             </ContextMenuGroup>
//             <ContextMenuSeparator />
//             <ContextMenuItem
//                 onSelect={(e) => {
//                     setDialogType('section')
//                     e.preventDefault()
//                 }}
//             >
//                 <span>New Section</span>
//             </ContextMenuItem>
//             <ContextMenuItem
//                 onSelect={(e) => {
//                     setDialogType('note')
//                     e.preventDefault()
//                 }}
//             >
//                 <span>New Note</span>
//             </ContextMenuItem>
//             <ContextMenuSeparator />
//             <ContextMenuItem
//                 onSelect={(e) => {
//                     deleteNode(item)
//                     e.preventDefault()
//                 }}
//             >
//                 <span>Delete</span>
//             </ContextMenuItem>
//             <NotesContextMenu type={dialogType} />
//         </ContextMenuContent>
//     )
// }
