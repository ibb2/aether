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
import { NotebookId, SectionId } from '@/db/schema'
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
import { notebooksQuery, sectionsQuery, notesQuery } from '@/db/queries'
import { eq } from 'drizzle-orm'

type ItemType = 'note' | 'notebook' | 'section'

export default function NewNotes() {
    const { create, update } = useEvolu<Database>()

    const [notebooks, sections, notes] = useQueries([
        notebooksQuery,
        sectionsQuery,
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
                create('notes', {
                    title: S.decodeSync(NonEmptyString1000)(newItemName),
                    notebookId: S.decodeSync(NotebookId)(selectedNotebook),
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
                    <Button variant="outline" className="h-full">
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
                        {newItemType === 'section' && (
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
                    </div>
                    <DialogFooter>
                        <Button onClick={addItem}>Add {newItemType}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
