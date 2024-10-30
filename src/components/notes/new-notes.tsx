'use client'

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

type ItemType = 'note' | 'notebook' | 'section'

export default function NewNotes() {
    const [notes, setNotes] = React.useState<string[]>([])
    const [notebooks, setNotebooks] = React.useState<string[]>([])
    const [sections, setSections] = React.useState<string[]>([])
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [newItemType, setNewItemType] = React.useState<ItemType>('note')
    const [newItemName, setNewItemName] = React.useState('')

    const openDialog = (type: ItemType) => {
        setNewItemType(type)
        setNewItemName('')
        setIsDialogOpen(true)
    }

    const addItem = () => {
        if (newItemName.trim() === '') return

        switch (newItemType) {
            case 'note':
                setNotes([...notes, newItemName])
                break
            case 'notebook':
                setNotebooks([...notebooks, newItemName])
                break
            case 'section':
                setSections([...sections, newItemName])
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
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={addItem}>Add {newItemType}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
