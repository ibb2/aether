'use client'

import * as S from '@effect/schema/Schema'

import * as React from 'react'
import { Book, FileText, FolderPlus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    FragmentId,
    NonEmptyString50,
    NotebookId,
    SectionId,
} from '@/db/schema'
import {
    useEvolu,
    NonEmptyString1000,
    useQueries,
    cast,
    useQuery,
} from '@evolu/react'
import { Database, evolu } from '@/db/db'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import {
    notebooksQuery,
    sectionsQuery,
    notesQuery,
    fragmentsQuery,
    fragmentsQuery2,
} from '@/db/queries'
import { eq } from 'drizzle-orm'
import { initialContent } from '@/lib/data/initialContent'

type ItemType = 'note' | 'notebook' | 'section'

export default function NotesContextMenu({ type }: { type: string }) {
    const { create, update } = useEvolu<Database>()

    const [notebooks, sections, fragments, notes] = useQueries([
        notebooksQuery,
        sectionsQuery,
        fragmentsQuery2,
        notesQuery,
    ])

    // const restrictedSectionsQuery = evolu.createQuery((db) =>
    //     db
    //         .selectFrom('sections')
    //         .where('isDeleted', 'is not', cast(true))
    //         .where(
    //             'notebookId',
    //             '==',
    //             S.decodeSync(NotebookId)(selectedNotebook)
    //         )
    //         .selectAll()
    // )

    // const restrictedSections = useQuery(restrictedSectionsQuery)

    const [selectedNotebook, setSelectedNotebook] = React.useState<
        string | null
    >()
    const [selectedSection, setSelectedSection] = React.useState<
        string | null
    >()
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [newItemType, setNewItemType] = React.useState<ItemType>('note')
    const [newItemName, setNewItemName] = React.useState('')

    const openDialog = (type: ItemType) => {
        setNewItemType(type)
        setNewItemName('')
        setIsDialogOpen(true)
    }

    // React.useEffect(() => {
    //     if (notebooks === undefined || notebooks === null) return

    //     if (notebooks.row !== null && notebooks.row.title !== null)
    //         setSelectedNotebook(S.decodeSync(S.String)(notebooks.row.title))
    // }, [notebooks])

    const addItem = () => {
        if (newItemName.trim() === '') return

        switch (newItemType) {
            case 'note':
                if (
                    selectedNotebook === null ||
                    selectedNotebook === undefined
                ) {
                    const { id: fragmentNoteId } = create('notes', {
                        title: S.decodeSync(NonEmptyString1000)(newItemName),
                        isFragment: true,
                    })

                    create('exportedData', {
                        noteId: fragmentNoteId,
                        jsonExportedName: S.decodeSync(NonEmptyString50)(
                            `doc_${fragmentNoteId}`
                        ),
                        jsonData: initialContent,
                    })

                    try {
                        update('fragments', {
                            id: fragments.row?.id,
                            notesId: [
                                ...(fragments.row?.notesId ?? []),
                                fragmentNoteId,
                            ],
                        })
                    } catch (e) {
                        create('fragments', {
                            notesId: [fragmentNoteId],
                        })
                    }
                    return
                }

                const { id: noteId } = create('notes', {
                    title: S.decodeSync(NonEmptyString1000)(newItemName),
                    notebookId: S.decodeSync(NotebookId)(selectedNotebook),
                    sectionId:
                        selectedSection === null ||
                        selectedSection === undefined
                            ? null
                            : S.decodeSync(SectionId)(selectedSection),
                })

                create('exportedData', {
                    noteId: noteId,
                    jsonExportedName: S.decodeSync(NonEmptyString50)(
                        `doc_${noteId}`
                    ),
                    jsonData: initialContent,
                })
                break
            case 'notebook':
                create('notebooks', {
                    title: S.decodeSync(NonEmptyString1000)(newItemName),
                })
                break
            case 'section':
                if (selectedNotebook === null) return
                create('sections', {
                    title: S.decodeSync(NonEmptyString1000)(newItemName),
                    parentId:
                        selectedSection === null ||
                        selectedSection === undefined
                            ? null
                            : S.decodeSync(SectionId)(selectedSection),
                    notebookId:
                        selectedNotebook === null ||
                        selectedNotebook === undefined
                            ? null
                            : S.decodeSync(NotebookId)(selectedNotebook),
                    isFolder: true,
                    isSection: true,
                })
                break
        }

        setIsDialogOpen(false)
        setNewItemName('')
    }

    return <div className="h-full">{getDialog(type)}</div>
}

function getDialog(type: string) {
    switch (type) {
        case 'renameSection':
            return renameDialogComponent()
        default:
            return undefined
    }
}

function renameDialogComponent() {
    return (
        <DialogContent
            className="sm:max-w-[425px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <DialogHeader>
                <DialogTitle>Rename Section</DialogTitle>
                <DialogDescription>New title.</DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder={item.name}
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        variant="secondary"
                        onClick={() => onRenameDialog(false)}
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        type="submit"
                        onClick={() => {
                            renameSection(currentName)
                            onRenameDialog(false)
                        }}
                    >
                        Update
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

function sectionDialogComponent() {
    return (
        <DialogContent
            className="sm:max-w-[425px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <DialogHeader>
                <DialogTitle>New Section</DialogTitle>
                <DialogDescription>
                    Organise your thoughts and ideas.
                </DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="new section"
                    onChange={(e) => setSectionName(e.target.value)}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        variant="secondary"
                        onClick={() => onSectionDialog(false)}
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        type="submit"
                        onClick={() => {
                            newSection()
                            onSectionDialog(false)
                        }}
                    >
                        Create
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

function noteDialogComponent() {
    return (
        <DialogContent
            className="sm:max-w-[425px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <DialogHeader>
                <DialogTitle>New Note</DialogTitle>
                <DialogDescription>A blank slate.</DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="new note"
                    onChange={(e) => setNoteName(e.target.value)}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        variant="secondary"
                        onClick={() => onNoteDialog(false)}
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        type="submit"
                        onClick={() => {
                            newNote()
                            onNoteDialog(false)
                        }}
                    >
                        Create
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}
