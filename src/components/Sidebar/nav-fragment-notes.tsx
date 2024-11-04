'use client'

import * as React from 'react'
import { ChevronRight, File, Folder } from 'lucide-react'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar'

import * as S from '@effect/schema/Schema'

import { cn } from '@/lib/utils'
import { memo, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import { NotebookDialog } from '../dialogs/notebook'
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
import {
    Diamond,
    FileIcon,
    Notebook,
    Settings,
    Settings2,
    SquarePen,
} from 'lucide-react'
import Link from 'next/link'
import { ReactSketchCanvasRef } from 'react-sketch-canvas'
import Node from '@/components/Sidebar/Arborist'
import useResizeObserver from 'use-resize-observer'
import { Popover, PopoverTrigger } from '.@/components/ui/popover'
import { PopoverContent } from '@radix-ui/react-popover'
import { Label } from '.@/components/ui/label'
import { Input } from '.@/components/ui/input'
import {
    Cloud,
    CreditCard,
    Github,
    Keyboard,
    LifeBuoy,
    LogOut,
    Mail,
    MessageSquare,
    Plus,
    PlusCircle,
    User,
    UserPlus,
    Users,
} from 'lucide-react'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Database, evolu } from '@/db/db'
import { NonEmptyString50, NoteId } from '@/db/schema'
import { initialContent } from '@/lib/data/initialContent'
import FragmentNode from './FragmentNode'
import { TreeDataItem, TreeView } from '../tree-view'
import useStateStore from '@/store/state'
import useNoteStore from '@/store/note'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import UserAvatar from '../auth/profile/UserAvatar'
import { signOut } from 'next-auth/react'
import { SignOutDialog } from '../auth/sign-out'
import { Button } from '@/components/ui/button'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
} from '.@/components/ui/context-menu'
import NotesContextMenu from '../dialogs/notes/context-menu'
import { ContextMenuTrigger } from '@radix-ui/react-context-menu'

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

export default function NavFragmentNotes() {
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
        console.log('Search results', searchTree(treeData, value))
        setTreeData(searchTree(treeData, query))
        if (value.length === 0) setTreeData(initialTreeData)
    }

    React.useEffect(() => {
        const getData = async () => {
            const transformedData = transformData(notebooks, sections, notes)
            const treeStructure = convertToTreeStructure(transformedData)
            setTreeData(treeStructure)
            setInitialTreeData(treeStructure)
            console.log('Treedata transformed data', transformedData)
        }

        const getFragmentsData = async () => {
            console.info('fragments', fragments)

            const arr: any = [
                {
                    id: 1,
                    title: 'Fragment Notes',
                    children: [],
                    type: 'header',
                },
            ]

            for (let i = 0; i < fragments.length; i++) {
                arr[0].children.push({
                    id: fragments[i].id,
                    title: S.decodeSync(S.String)(fragments[i].title!),
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

    // Update selectNote to use the query results
    const selectNote = (item: any) => {
        console.log('item', item)
        setNote(item)
        setTreeData(initialTreeData)
        setQuery('')
    }

    const deleteNote = (item) => {
        update('notes', {
            id: S.decodeSync(NoteId)(item.id),
            isDeleted: true,
        })
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Fragments</SidebarGroupLabel>

            <SidebarMenu>
                {treeData !== undefined && (
                    <>
                        {fragmentsData.map((item: any) => (
                            <Tree
                                key={item.id}
                                item={item}
                                selectNote={selectNote}
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
    deleteNote,
}: {
    item: any
    selectNote: any
    deleteNote: (item: any) => void
}) {
    const [dialogType, setDialogType] = React.useState<string>('')

    const { update } = useEvolu<Database>()
    const [openDialog, setOpenDialog] = React.useState<boolean>(false)

    if (item.children === undefined && item.type === 'fragment') {
        return (
            <ContextMenu>
                <ContextMenuTrigger>
                    <SidebarMenuButton
                        // isActive={name === 'button.tsx'}
                        className="data-[active=true]:bg-transparent"
                        onClick={() => {
                            selectNote(item)
                        }}
                    >
                        <File />
                        {item.title}
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
        <Collapsible key={item.id} asChild defaultOpen={true}>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                    <a href="#">
                        <Diamond />
                        <span>{item.title}</span>
                    </a>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children.length > 0 && (
                            <>
                                {item.children.map(
                                    (fragment: {
                                        id: string
                                        name: string
                                        type: string
                                    }) => (
                                        <SidebarMenuSubItem key={item.id}>
                                            <SidebarMenuSubButton asChild>
                                                <Tree
                                                    key={fragment.id}
                                                    item={fragment}
                                                    selectNote={selectNote}
                                                    deleteNote={deleteNote}
                                                />
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    )
                                )}
                            </>
                        )}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}
