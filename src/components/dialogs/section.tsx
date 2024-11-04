'use client'

import * as S from '@effect/schema/Schema'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '.@/components/ui/label'
import { Input } from '.@/components/ui/input'
import React, { useState } from 'react'
import { NonEmptyString1000, useEvolu } from '@evolu/react'
import type { Database } from '@/db/db'
import { Brand } from 'effect/Brand'

interface SectionDialogProps {
    notebookId: string & Brand<'Id'> & Brand<'Notebook'>
    children: React.ReactNode
}

export const SectionDialog = ({ notebookId, children }: SectionDialogProps) => {
    const [sectionName, setSectionName] = useState('')
    const [open, setOpen] = useState(false)
    const { create } = useEvolu<Database>()

    const handleCreate = () => {
        create('sections', {
            title: S.decodeSync(NonEmptyString1000)(sectionName),
            notebookId: notebookId,
            isFolder: true,
            isSection: true,
        })
        setOpen(false)
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
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleCreate}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
