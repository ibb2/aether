'use client'

import * as S from '@effect/schema/Schema'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NonEmptyString50, NotebookId, NoteId, SectionId } from '@/db/schema'
import { useEvolu, NonEmptyString1000, cast } from '@evolu/react'
import { Database } from '@/db/db'
import { initialContent } from '@/lib/data/initialContent'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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
    const { create, update } = useEvolu<Database>()

    // Handling renaming of notebooks, sections and notes
    const [currentName, setCurrentName] = React.useState<string>('')
    const [selectedNoteType, setSelectedNoteType] = React.useState('Default')

    React.useEffect(() => {
        setCurrentName(type === 'rename' ? item.name || item.title : '')
    }, [type, item])

    const rename = (newName: string) => {
        setCurrentName('')

        if (item.type === 'note' || item.type === 'fragment') {
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

    // Related to creating new sections
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

    // Handle creating a new note
    const newNote = (noteName: string) => {
        let newNote: NoteId

        if (item.type === 'notebook') {
            const { id: noteId } = create('notes', {
                title: S.decodeSync(NonEmptyString1000)(noteName),
                notebookId: S.decodeSync(NotebookId)(item.id),
                noteType: S.decodeSync(NonEmptyString50)(selectedNoteType),
            })

            newNote = noteId
        } else {
            const { id: noteId } = create('notes', {
                title: S.decodeSync(NonEmptyString1000)(noteName),
                notebookId: S.decodeSync(NotebookId)(item.notebookId),
                sectionId: S.decodeSync(SectionId)(item.id),
                noteType: S.decodeSync(NonEmptyString50)(selectedNoteType),
            })

            newNote = noteId
        }

        create('exportedData', {
            noteId: newNote,
            jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${newNote}`),
            jsonData: selectedNoteType === 'Default' ?? initialContent,
        })

        create('noteSettings', {
            noteId: newNote,
            pageType: selectedNoteType === 'Default' ? 1 : 2,
            isInkEnabled: cast(true),
            isPageSplit: cast(false),
        })

        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="h-full">
                {getDialog(
                    type,
                    item,
                    currentName,
                    setCurrentName,
                    selectedNoteType,
                    setSelectedNoteType,
                    rename,
                    newSection,
                    newNote
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
    selectedNoteType: any,
    setSelectedNoteType: React.Dispatch<any>,
    rename: (newName: string) => void,
    newSection: (sectionName: string) => void,
    newNote: (noteName: string) => void
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
        case 'note':
            return noteDialogComponent(
                item,
                currentName,
                setCurrentName,
                selectedNoteType,
                setSelectedNoteType,
                newNote
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

function noteDialogComponent(
    item: any,
    currentName: any,
    setCurrentName: React.Dispatch<any>,
    selectedNoteType: any,
    setSelectedNoteType: React.Dispatch<any>,
    newNote: (noteName: string) => void
) {
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
                    onChange={(e) => setCurrentName(e.target.value)}
                />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                <Label htmlFor="name">Note Type</Label>
                <Select
                    value={selectedNoteType}
                    onValueChange={setSelectedNoteType}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {NoteTypes.map((nt) => (
                            <SelectItem key={nt.key} value={nt.type}>
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
            <DialogFooter>
                <DialogClose>
                    <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose>
                    <Button
                        type="submit"
                        onClick={() => {
                            newNote(currentName)
                        }}
                    >
                        Create
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}
