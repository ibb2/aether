"use client";

import * as S from "@effect/schema/Schema";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "../ui/Button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import React, { useState } from "react";
import { NonEmptyString1000, useEvolu, useQuery, String } from "@evolu/react";
import type { Database } from "@/db/db";
import { notebooksQuery } from "@/db/queries";
import { NonEmptyString50, NotebookId, NotebooksTable } from "@/db/schema";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";
import { initialContent } from "@/lib/data/initialContent";
import { Brand } from "effect/Brand";
import useNoteDialogStore from "@/store/note-dialog";

interface NoteDialogProps {
  notebookId: string & Brand<"Id"> & Brand<"Notebook">;
  notebookTitle: string & Brand<"String"> & Brand<"NonEmptyString1000">;
  section: any | null;
  children: any;
}

export const NoteDialog = ({
  notebookId,
  notebookTitle,
  section,
  children,
}: NoteDialogProps) => {
  const [noteName, setNoteName] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Zustand Stores
  const { isOpen, toggle } = useNoteDialogStore((s) => ({
    isOpen: s.isOpen,
    toggle: s.toggle,
  }));

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const { rows } = useQuery(notebooksQuery);
  const { create } = useEvolu<Database>();

  const [selectedNotebook, setSelectedNotebook] = React.useState(notebookId);

  const handler = () => {
    const { id: noteId } = create("notes", {
      title: S.decodeSync(NonEmptyString1000)(noteName),
      notebookId: selectedNotebook,
    });

    const { id: exportedDataId } = create("exportedData", {
      noteId,
      jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${noteId}`),
      jsonData: initialContent,
    });

    console.log("Exported Data for note created: ", exportedDataId);
  };

  return (
    <Dialog>
      {children}
      {/* <DialogTrigger asChild>{children}</DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
          <DialogDescription>A clean slate.</DialogDescription>
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-1.5 pt-2.5">
          <div className="py-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              placeholder="new note"
              onChange={(e) => setNoteName(e.target.value)}
            />
          </div>
          {section == null ? (
            <div className="w-full pb-2">
              <Label htmlFor="notebooks">Notebooks</Label>
              <Select
                value={selectedNotebook}
                onValueChange={(value) => {
                  setSelectedNotebook(S.decodeSync(NotebookId)(value));
                  console.info("Changed value", value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={rows[0].title} />
                </SelectTrigger>
                <SelectContent id="notebooks" className="w-full">
                  {rows.map((notebook, index) => (
                    <SelectItem
                      value={notebook.id}
                      key={index}
                      className="w-full"
                    >
                      {notebook.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="w-full pb-2">
              <Select
                value={section}
                onValueChange={(value) => {
                  setSelectedNotebook(S.decodeSync(NotebookId)(value));
                  console.info("Changed value", value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={rows[0].title} />
                </SelectTrigger>
                <SelectContent id="notebooks" className="w-full">
                  {rows.map((notebook, index) => (
                    <SelectItem
                      value={notebook.id}
                      key={index}
                      className="w-full"
                    >
                      {notebook.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
  );
};
