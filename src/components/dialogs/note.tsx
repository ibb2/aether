'use client'

import * as S from '@effect/schema/Schema'

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { Button } from '.@/components/ui/button'
import { Label } from '.@/components/ui/label'
import { Input } from '.@/components/ui/input'
import React, { useState } from 'react'
import { NonEmptyString1000, useEvolu, useQuery, String } from '@evolu/react'
import type { Database } from '@/db/db'
import { notebooksQuery } from '@/db/queries'
import { NonEmptyString50, NotebookId, NotebooksTable } from '@/db/schema'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@radix-ui/react-dropdown-menu'
import { initialContent } from '@/lib/data/initialContent'
import { Brand } from 'effect/Brand'
import useNoteDialogStore from '@/store/note-dialog'

interface NoteDialogProps {
    notebookId: string & Brand<'Id'> & Brand<'Notebook'>
    notebookTitle: string & Brand<'String'> & Brand<'NonEmptyString1000'>
    section: any | null
    children: any
}

export const NoteDialog = ({
    notebookId,
    notebookTitle,
    section,
    children,
}: NoteDialogProps) => {
    const [noteName, setNoteName] = React.useState('')
    const [open, setOpen] = React.useState(false)

    // Zustand Stores
    const { isOpen, toggle } = useNoteDialogStore((s) => ({
        isOpen: s.isOpen,
        toggle: s.toggle,
    }))

    React.useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    const { rows } = useQuery(notebooksQuery)
    const { create } = useEvolu<Database>()

    const [selectedNotebook, setSelectedNotebook] = React.useState(notebookId)

    const create = () => {
        const { id: noteId } = create('notes', {
            title: S.decodeSync(NonEmptyString1000)(noteName),
            notebookId: selectedNotebook,
        })

        const { id: exportedDataId } = create('exportedData', {
            noteId,
            jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${noteId}`),
            jsonData: initialContent,
        })

        console.log('Exported Data for note created: ', exportedDataId)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px]"
                onClick={(e) => e.stopPropagation()}
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
                        value={noteName}
                        onChange={(e) => setNoteName(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={create}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
