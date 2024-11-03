'use client'

import * as S from '@effect/schema/Schema'

import * as React from 'react'
import { Book, FileText, FolderPlus, Notebook, Plus } from 'lucide-react'

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
    NoteId,
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
} from '@/components/ui/select'
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

export default function NotesContextMenu({
    type,
    open,
    item,
    setOpen,
}: {
    type: string
    open: boolean
    item: any
    setOpen: (open: boolean) => void
}) {
    const [sectionDialog, onSectionDialog] = React.useState(false)
    const [noteDialog, onNoteDialog] = React.useState(false)
    const [renameDialog, onRenameDialog] = React.useState(false)
    const [sectionName, setSectionName] = React.useState('')
    const [noteName, setNoteName] = React.useState('')

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

    // Handling renaming of notebooks, sections and notes

    const [currentName, setCurrentName] = React.useState(
        item.type === 'note' ? item.name : ''
    )

    const rename = (newName: string) => {
        setCurrentName('')

        if (item.type === 'note') {
            update('notes', {
                id: S.decodeSync(NoteId)(item.id),
                title: S.decodeSync(NonEmptyString1000)(newName),
            })
        }
        if (item.type === 'section') {
            update('sections', {
                id: S.decodeSync(SectionId)(item.id),
                title: S.decodeSync(NonEmptyString1000)(newName),
            })
        }

        if (item.type === 'notebook') {
            update('notebooks', {
                id: S.decodeSync(NotebookId)(item.id),
                title: S.decodeSync(NonEmptyString1000)(newName),
            })
        }

        setOpen(false)
    }

    // new section
    const newSection = (sectionName: string) => {
        setCurrentName('')

        create('sections', {
            title: S.decodeSync(NonEmptyString1000)(sectionName),
            parentId: S.decodeSync(SectionId)(item.id),
            notebookId: S.decodeSync(NotebookId)(item.notebookId ?? item.id),
            isFolder: true,
            isSection: true,
        })

        setOpen(false)
    }

    const newNote = (noteName: string) => {
        let newNote: NoteId

        if (item.type === 'notebook') {
            const { id: noteId } = create('notes', {
                title: S.decodeSync(NonEmptyString1000)(noteName),
                notebookId: S.decodeSync(NotebookId)(item.id),
            })

            newNote = noteId
        } else {
            const { id: noteId } = create('notes', {
                title: S.decodeSync(NonEmptyString1000)(noteName),
                notebookId: S.decodeSync(NotebookId)(item.notebookId),
                sectionId: S.decodeSync(SectionId)(item.id),
            })

            newNote = noteId
        }

        create('exportedData', {
            noteId: newNote,
            jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${newNote}`),
            jsonData: initialContent,
        })

        create('noteSettings', {
            noteId: newNote,
            pageType: 1,
            isInkEnabled: cast(true),
            isPageSplit: cast(false),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="h-full">
                {getDialog(
                    type,
                    item,
                    currentName,
                    setCurrentName,
                    rename,
                    newSection
                )}
            </div>
        </Dialog>
    )
}

function getDialog(
    type: string,
    item: any,
    currentName: any,
    setCurrentName: React.Dispatch<any>,
    rename: (newName: string) => void,
    newSection: (sectionName: string) => void
) {
    switch (type) {
        case 'rename':
            return renameDialogComponent(
                item,
                currentName,
                setCurrentName,
                rename
            )
        case 'section':
            return sectionDialogComponent(
                item,
                currentName,
                setCurrentName,
                newSection
            )
        default:
            return undefined
    }
}

function renameDialogComponent(
    item: any,
    currentName: any,
    setCurrentName: React.Dispatch<any>,
    rename: (newName: string) => void
) {
    return (
        <DialogContent
            className="sm:max-w-[425px] z-[60]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <DialogHeader>
                <DialogTitle>Rename {item.type.toUpperCase()}</DialogTitle>
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
                <DialogClose>
                    <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        type="submit"
                        onClick={() => {
                            rename(currentName)
                        }}
                    >
                        Update
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

function sectionDialogComponent(
    item: any,
    currentName: any,
    setCurrentName: React.Dispatch<any>,
    newSection: (sectionName: string) => void
) {
    return (
        <DialogContent
            className="sm:max-w-[425px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <DialogHeader>
                <DialogTitle>New Section</DialogTitle>
                <DialogDescription>
                    Organize your thoughts and ideas.
                </DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="new section"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                />
            </div>
            <DialogFooter>
                <DialogClose>
                    <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose>
                    <Button
                        type="submit"
                        onClick={() => {
                            console.log('new section', item)
                            newSection(currentName)
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
