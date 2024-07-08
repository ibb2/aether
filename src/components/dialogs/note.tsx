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
import { NotebookId, NotebooksTable } from "@/db/schema";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";

export const NoteDialog = () => {
  const [noteName, setNoteName] = React.useState("");

  const { rows } = useQuery(notebooksQuery);
  const { create } = useEvolu<Database>();

  const [selectedNotebook, setSelectedNotebook] = React.useState(rows[0].id);

  const handler = () => {
    create("notes", {
      name: S.decodeSync(NonEmptyString1000)(noteName),
      notebookId: selectedNotebook,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New note</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New notebook</DialogTitle>
          <DialogDescription>
            Organise your toughts and ideas in a new space.
          </DialogDescription>
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
          <div className="w-full pb-2">
            <Label htmlFor="notebooks">Notebooks</Label>
            <Select
              value={S.decodeSync(String)(selectedNotebook)}
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
