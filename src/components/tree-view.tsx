'use client'

import React, { useState, useCallback } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as S from '@effect/schema/Schema'
import { ChevronRight, Trash } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
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
    cast,
    NonEmptyString1000,
    useEvolu,
    useQueries,
    useQuery,
} from '@evolu/react'
import {
    NonEmptyString50,
    NotebookId,
    NoteId,
    SectionId,
    SectionsTable,
} from '@/db/schema'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    notebooksQuery,
    notesQuery,
    sectionsQuery,
    settingQuery,
} from '@/db/queries'
import { Database, evolu } from '@/db/db'
import useNoteDialogStore from '@/store/note-dialog'
import useNoteStore from '@/store/note'
import useStateStore from '@/store/state'
import { initialContent } from '@/lib/data/initialContent'

const treeVariants = cva(
    'group hover:before:opacity-100 before:absolute before:rounded-lg before:left-0 px-2 before:w-full before:opacity-0 before:bg-accent/70 before:h-[2rem] before:-z-10'
)

const selectedTreeVariants = cva(
    'before:opacity-100 before:bg-accent/70 text-accent-foreground'
)

interface TreeDataItem {
    id: string
    name: string
    icon?: any
    selectedIcon?: any
    openIcon?: any
    children?: TreeDataItem[]
    actions?: React.ReactNode
    onClick?: () => void
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
    data: TreeDataItem[] | TreeDataItem
    initialSelectedItemId?: string
    onSelectChange?: (item: TreeDataItem | undefined) => void
    expandAll?: boolean
    defaultNodeIcon?: any
    defaultLeafIcon?: any
}

const TreeView = React.forwardRef<HTMLDivElement, TreeProps>(
    (
        {
            data,
            initialSelectedItemId,
            onSelectChange,
            expandAll,
            defaultLeafIcon,
            defaultNodeIcon,
            className,
            ...props
        },
        ref
    ) => {
        const [selectedItemId, setSelectedItemId] = React.useState<
            string | undefined
        >(initialSelectedItemId)

        const handleSelectChange = React.useCallback(
            (item: TreeDataItem | undefined) => {
                setSelectedItemId(item?.id)
                if (onSelectChange) {
                    onSelectChange(item)
                }
            },
            [onSelectChange]
        )

        const expandedItemIds = React.useMemo(() => {
            if (!initialSelectedItemId) {
                return [] as string[]
            }

            const ids: string[] = []

            function walkTreeItems(
                items: TreeDataItem[] | TreeDataItem,
                targetId: string
            ) {
                if (items instanceof Array) {
                    for (let i = 0; i < items.length; i++) {
                        ids.push(items[i]!.id)
                        if (walkTreeItems(items[i]!, targetId) && !expandAll) {
                            return true
                        }
                        if (!expandAll) ids.pop()
                    }
                } else if (!expandAll && items.id === targetId) {
                    return true
                } else if (items.children) {
                    return walkTreeItems(items.children, targetId)
                }
            }

            walkTreeItems(data, initialSelectedItemId)
            return ids
        }, [data, expandAll, initialSelectedItemId])

        return (
            <div className={cn('overflow-hidden relative p-2', className)}>
                <TreeItem
                    data={data}
                    ref={ref}
                    selectedItemId={selectedItemId}
                    handleSelectChange={handleSelectChange}
                    expandedItemIds={expandedItemIds}
                    defaultLeafIcon={defaultLeafIcon}
                    defaultNodeIcon={defaultNodeIcon}
                    className={className}
                    {...props}
                />
            </div>
        )
    }
)

TreeView.displayName = 'TreeView'

type TreeItemProps = TreeProps & {
    selectedItemId?: string
    handleSelectChange: (item: TreeDataItem | undefined) => void
    expandedItemIds: string[]
    defaultNodeIcon?: any
    defaultLeafIcon?: any
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
    (
        {
            className,
            data,
            selectedItemId,
            handleSelectChange,
            expandedItemIds,
            defaultNodeIcon,
            defaultLeafIcon,
            ...props
        },
        ref
    ) => {
        if (!(data instanceof Array)) {
            data = [data]
        }

        return (
            <div ref={ref} role="tree" className={className} {...props}>
                <ul>
                    {data.map((item) => (
                        <li key={item.id}>
                            {item.children ? (
                                <TreeNode
                                    item={item}
                                    selectedItemId={selectedItemId}
                                    expandedItemIds={expandedItemIds}
                                    handleSelectChange={handleSelectChange}
                                    defaultNodeIcon={defaultNodeIcon}
                                    defaultLeafIcon={defaultLeafIcon}
                                />
                            ) : (
                                <TreeLeaf
                                    item={item}
                                    selectedItemId={selectedItemId}
                                    handleSelectChange={handleSelectChange}
                                    defaultLeafIcon={defaultLeafIcon}
                                    className={className}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
)

TreeItem.displayName = 'TreeItem'

const TreeNode = ({
    item,
    handleSelectChange,
    expandedItemIds,
    selectedItemId,
    defaultNodeIcon,
    defaultLeafIcon,
}: {
    item: TreeDataItem
    handleSelectChange: (item: TreeDataItem | undefined) => void
    expandedItemIds: string[]
    selectedItemId?: string
    defaultNodeIcon?: any
    defaultLeafIcon?: any
}) => {
    const [value, setValue] = React.useState(
        expandedItemIds.includes(item.id) ? [item.id] : []
    )

    const { create, update } = useEvolu<Database>()

    const [sectionDialog, onSectionDialog] = React.useState(false)
    const [noteDialog, onNoteDialog] = React.useState(false)
    const [renameDialog, onRenameDialog] = React.useState(false)
    const [currentName, setCurrentName] = React.useState('')
    const [sectionName, setSectionName] = React.useState('')
    const [noteName, setNoteName] = React.useState('')

    const inputRef = React.useRef(null)

    const openDialog = (dialogType: string) => {
        if (dialogType === 'section') {
            onSectionDialog(true)
            onNoteDialog(false)
            onRenameDialog(false)
        } else if (dialogType === 'note') {
            onSectionDialog(false)
            onNoteDialog(true)
            onRenameDialog(false)
        } else {
            onSectionDialog(false)
            onNoteDialog(false)
            onRenameDialog(true)
            setCurrentName(item.name)
        }
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }, 0)
    }

    const renameSection = (newName: string) => {
        setCurrentName('')

        if (item.type === 'notebook') {
            update('notebooks', {
                id: S.decodeSync(NotebookId)(item.id),
                title: S.decodeSync(NonEmptyString1000)(newName),
            })
        } else {
            update('sections', {
                id: S.decodeSync(SectionId)(item.id),
                title: S.decodeSync(NonEmptyString1000)(currentName),
            })
        }
    }

    const newSection = () => {
        if (item.type === 'notebook') {
            create('sections', {
                title: S.decodeSync(NonEmptyString1000)(sectionName),
                notebookId: S.decodeSync(NotebookId)(item.id),
                isFolder: true,
                isSection: true,
            })
        } else {
            create('sections', {
                title: S.decodeSync(NonEmptyString1000)(sectionName),
                parentId: S.decodeSync(SectionId)(item.id),
                notebookId: S.decodeSync(NotebookId)(item.notebookId),
                isFolder: true,
                isSection: true,
            })
        }
    }

    const newNote = () => {
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

    const deleteNode = () => {
        if (item.type === 'section') {
            update('sections', {
                id: S.decodeSync(SectionId)(item.id),
                isDeleted: true,
            })
        }
    }

    return (
        <Dialog>
            <ContextMenu>
                <AccordionPrimitive.Root
                    type="multiple"
                    value={value}
                    onValueChange={(s) => setValue(s)}
                >
                    <AccordionPrimitive.Item value={item.id}>
                        <ContextMenuTrigger asChild>
                            <AccordionTrigger
                                className={cn(
                                    treeVariants(),
                                    selectedItemId === item.id &&
                                        selectedTreeVariants()
                                )}
                                onClick={() => {
                                    handleSelectChange(item)
                                    item.onClick?.()
                                }}
                            >
                                <TreeIcon
                                    item={item}
                                    isSelected={selectedItemId === item.id}
                                    isOpen={value.includes(item.id)}
                                    default={defaultNodeIcon}
                                />
                                <span className="text-sm truncate">
                                    {item.name}
                                </span>
                                <TreeActions
                                    isSelected={selectedItemId === item.id}
                                >
                                    {item.actions}
                                </TreeActions>
                            </AccordionTrigger>
                        </ContextMenuTrigger>

                        <AccordionContent className="ml-4 pl-1 border-l">
                            <TreeItem
                                data={item.children ? item.children : item}
                                selectedItemId={selectedItemId}
                                handleSelectChange={handleSelectChange}
                                expandedItemIds={expandedItemIds}
                                defaultLeafIcon={defaultLeafIcon}
                                defaultNodeIcon={defaultNodeIcon}
                            />
                        </AccordionContent>
                    </AccordionPrimitive.Item>
                </AccordionPrimitive.Root>
                <ContextMenuContent>
                    <DialogTrigger asChild>
                        <ContextMenuItem
                            onSelect={(e) => {
                                openDialog('rename')
                                e.preventDefault()
                                console.log('notebook and section ', item)
                            }}
                        >
                            <span>Rename</span>
                        </ContextMenuItem>
                    </DialogTrigger>
                    <ContextMenuSeparator />
                    <DialogTrigger asChild>
                        <ContextMenuItem
                            onSelect={(e) => {
                                openDialog('section')
                                e.preventDefault()
                            }}
                        >
                            <span>New Section</span>
                        </ContextMenuItem>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        <ContextMenuItem
                            onSelect={(e) => {
                                openDialog('note')
                                e.preventDefault()
                            }}
                        >
                            <span>New Note</span>
                        </ContextMenuItem>
                    </DialogTrigger>
                    <ContextMenuSeparator />
                    <DialogTrigger asChild>
                        <ContextMenuItem
                            onSelect={(e) => {
                                deleteNode()
                                e.preventDefault()
                            }}
                        >
                            <span>Delete</span>
                        </ContextMenuItem>
                    </DialogTrigger>
                    {renameDialog && (
                        <DialogContent
                            className="sm:max-w-[425px]"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <DialogHeader>
                                <DialogTitle>Rename Section</DialogTitle>
                                <DialogDescription>
                                    New title.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder={item.name}
                                    value={currentName}
                                    onChange={(e) =>
                                        setCurrentName(e.target.value)
                                    }
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
                    )}
                    {sectionDialog && (
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
                                    onChange={(e) =>
                                        setSectionName(e.target.value)
                                    }
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
                    )}
                    {noteDialog && (
                        <DialogContent
                            className="sm:max-w-[425px]"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <DialogHeader>
                                <DialogTitle>New Note</DialogTitle>
                                <DialogDescription>
                                    A blank slate.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder="new note"
                                    onChange={(e) =>
                                        setNoteName(e.target.value)
                                    }
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
                    )}
                </ContextMenuContent>
            </ContextMenu>
        </Dialog>
    )
}

const TreeLeaf = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        item: TreeDataItem
        selectedItemId?: string
        handleSelectChange: (item: TreeDataItem | undefined) => void
        defaultLeafIcon?: any
    }
>(
    (
        {
            className,
            item,
            selectedItemId,
            handleSelectChange,
            defaultLeafIcon,
            ...props
        },
        ref
    ) => {
        const { update } = useEvolu<Database>()

        const [currentName, setCurrentName] = React.useState(item.name)

        const renameNote = (nameOfNewNote: string) => {
            setCurrentName('')

            update('notes', {
                id: S.decodeSync(NoteId)(item.id),
                title: S.decodeSync(NonEmptyString1000)(nameOfNewNote),
            })
        }

        const deleteNote = () => {
            update('notes', {
                id: S.decodeSync(NoteId)(item.id),
                isDeleted: true,
            })
        }

        return (
            <Dialog>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <div
                            ref={ref}
                            className={cn(
                                'ml-5 flex text-left items-center py-2 cursor-pointer before:right-1',
                                treeVariants(),
                                className,
                                selectedItemId === item.id &&
                                    selectedTreeVariants()
                            )}
                            onClick={() => {
                                handleSelectChange(item)
                                item.onClick?.()
                            }}
                            {...props}
                        >
                            <TreeIcon
                                item={item}
                                isSelected={selectedItemId === item.id}
                                default={defaultLeafIcon}
                            />
                            <span className="flex-grow text-sm truncate">
                                {item.name}
                            </span>
                            <TreeActions
                                isSelected={selectedItemId === item.id}
                            >
                                {item.actions}
                            </TreeActions>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <DialogTrigger asChild>
                            <ContextMenuItem
                                onSelect={(e) => {
                                    e.preventDefault()
                                    console.log('notebook and section ', item)
                                }}
                            >
                                <span>Rename</span>
                            </ContextMenuItem>
                        </DialogTrigger>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                            onSelect={(e) => {
                                deleteNote()
                                e.preventDefault()
                            }}
                        >
                            <span>Delete</span>
                        </ContextMenuItem>
                    </ContextMenuContent>
                    <DialogContent
                        className="sm:max-w-[425px]"
                        onClick={useCallback((e) => e.stopPropagation(), [])}
                        onKeyDown={useCallback((e) => e.stopPropagation(), [])}
                    >
                        <DialogHeader>
                            <DialogTitle>Rename Note</DialogTitle>
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
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button
                                    type="submit"
                                    onClick={() => {
                                        renameNote(currentName)
                                    }}
                                >
                                    Update
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </ContextMenu>
            </Dialog>
        )
    }
)

TreeLeaf.displayName = 'TreeLeaf'

const AccordionTrigger = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                'flex flex-1 w-full items-center py-2 transition-all first:[&[data-state=open]>svg]:rotate-90',
                className
            )}
            {...props}
        >
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50 mr-1" />
            {children}
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={cn(
            'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
            className
        )}
        {...props}
    >
        <div className="pb-1 pt-0">{children}</div>
    </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

const TreeIcon = ({
    item,
    isOpen,
    isSelected,
    default: defaultIcon,
}: {
    item: TreeDataItem
    isOpen?: boolean
    isSelected?: boolean
    default?: any
}) => {
    let Icon = defaultIcon
    if (isSelected && item.selectedIcon) {
        Icon = item.selectedIcon
    } else if (isOpen && item.openIcon) {
        Icon = item.openIcon
    } else if (item.icon) {
        Icon = item.icon
    }
    return Icon ? <Icon className="h-4 w-4 shrink-0 mr-2" /> : <></>
}

const TreeActions = ({
    children,
    isSelected,
}: {
    children: React.ReactNode
    isSelected: boolean
}) => {
    return (
        <div
            className={cn(
                isSelected ? 'block' : 'hidden',
                'absolute right-3 group-hover:block'
            )}
        >
            {children}
        </div>
    )
}

export { TreeView, type TreeDataItem }
