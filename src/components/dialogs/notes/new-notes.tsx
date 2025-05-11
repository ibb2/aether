'use client'

import * as S from '@effect/schema/Schema'

import * as React from 'react'
import { Book, FileText, FolderPlus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
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

const NoteTypes = [
    {
        key: '1',
        type: 'Default',
    },
    {
        key: '2',
        type: 'Blank',
    },
]

export default function NewNotes() {
    const { create, update } = useEvolu<Database>()

    const [notebooks, sections, fragments, notes] = useQueries([
        notebooksQuery,
        sectionsQuery,
        fragmentsQuery2,
        notesQuery,
    ])

    const [selectedNotebook, setSelectedNotebook] = React.useState<
        string | null
    >()
    const [selectedSection, setSelectedSection] = React.useState<
        string | null
    >()
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [newItemType, setNewItemType] = React.useState<ItemType>('note')
    const [newItemName, setNewItemName] = React.useState('')

    const [selectedNoteType, setSelectedNoteType] = React.useState('Default')

    const openDialog = (type: ItemType) => {
        setNewItemType(type)
        setNewItemName('')
        setIsDialogOpen(true)
    }

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
                        noteType:
                            S.decodeSync(NonEmptyString50)(selectedNoteType),
                    })

                    create('exportedData', {
                        noteId: fragmentNoteId,
                        jsonExportedName: S.decodeSync(NonEmptyString50)(
                            `doc_${fragmentNoteId}`
                        ),
                        jsonData:
                            selectedNoteType === 'Default' ?? initialContent,
                    })

                    create('noteSettings', {
                        noteId: fragmentNoteId,
                        pageType: selectedNoteType === 'Default' ? 1 : 2,
                        isInkEnabled: cast(true),
                        isPageSplit: cast(false),
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
                    noteType: S.decodeSync(NonEmptyString50)(selectedNoteType),
                })

                create('exportedData', {
                    noteId: noteId,
                    jsonExportedName: S.decodeSync(NonEmptyString50)(
                        `doc_${noteId}`
                    ),
                    jsonData: selectedNoteType === 'Default' ?? initialContent,
                })

                create('noteSettings', {
                    noteId: noteId,
                    pageType: selectedNoteType === 'Default' ? 1 : 2,
                    isInkEnabled: cast(true),
                    isPageSplit: cast(false),
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

    return (
        <div className="h-full">
            <DropdownMenu>
                <DropdownMenuTrigger className="" asChild>
                    <Button variant="ghost" className="h-full">
                        <Plus />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right">
                    <DropdownMenuItem onSelect={() => openDialog('note')}>
                        <FileText className="mr-2 h-4 w-4" />
                        New Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openDialog('notebook')}>
                        <Book className="mr-2 h-4 w-4" />
                        New Notebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openDialog('section')}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        New Section
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add New{' '}
                            {newItemType.charAt(0).toUpperCase() +
                                newItemType.slice(1)}
                        </DialogTitle>
                        <DialogDescription>
                            Enter a name for your new {newItemType}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col w-full gap-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        {newItemType !== 'notebook' && (
                            <div className="flex flex-col w-full gap-y-2">
                                <Label htmlFor="name">Notebooks</Label>
                                <Select
                                    value={
                                        selectedNotebook ??
                                        notebooks.row?.title ??
                                        ''
                                    }
                                    onValueChange={setSelectedNotebook}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                notebooks.row?.title ??
                                                'Select a notebook...'
                                            }
                                            defaultValue={
                                                notebooks.row?.title ?? ''
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {notebooks.rows.map((notebook) => (
                                            <SelectItem
                                                key={notebook.id}
                                                value={notebook.id}
                                            >
                                                {notebook.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {newItemType !== 'notebook' && (
                            <div className="flex flex-col w-full gap-y-2">
                                <Label htmlFor="name">Section</Label>
                                <Select
                                    value={
                                        selectedSection ??
                                        sections.row?.title ??
                                        ''
                                    }
                                    onValueChange={setSelectedSection}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                sections.row?.title ??
                                                'Select a section...'
                                            }
                                            defaultValue={
                                                sections.row?.title ?? ''
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.rows.map((section) => (
                                            <SelectItem
                                                key={section.id}
                                                value={section.id}
                                            >
                                                {section.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {newItemType === 'note' && (
                            <div className="flex flex-col w-full gap-y-2">
                                <Label htmlFor="name">Type</Label>
                                <Select
                                    value={selectedNoteType}
                                    onValueChange={setSelectedNoteType}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NoteTypes.map((nt) => (
                                            <SelectItem
                                                key={nt.key}
                                                value={nt.type}
                                            >
                                                {nt.type}
                                            </SelectItem>
                                        ))}
                                        {/* {sections.rows.map((section) => (
                                            <SelectItem
                                                key={section.id}
                                                value={section.id}
                                            >
                                                {section.title}
                                            </SelectItem>
                                        ))} */}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={addItem}>Add {newItemType}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
