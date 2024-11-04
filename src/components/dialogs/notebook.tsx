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
import { Button } from '.@/components/ui/button'
import { Label } from '.@/components/ui/label'
import { Input } from '.@/components/ui/input'
import React, { Children, useState } from 'react'
import { NonEmptyString1000, useEvolu } from '@evolu/react'
import type { Database } from '@/db/db'

interface NotebookDialogProps {
    children: any
}

export const NotebookDialog = ({ children }: NotebookDialogProps) => {
    const [notebookName, setNotebookName] = React.useState('')

    const { create } = useEvolu<Database>()

    const handler = () => {
        create('notebooks', {
            title: S.decodeSync(NonEmptyString1000)(notebookName),
        })
    }

    return (
        <Dialog modal>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New notebook</DialogTitle>
                    <DialogDescription>
                        Organise your toughts and ideas in a new space.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        type="text"
                        id="name"
                        placeholder="new notebook"
                        onChange={(e) => setNotebookName(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="submit" onClick={handler}>
                            Create
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
