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
import { Button } from "../ui/Button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import React, { useState } from "react";
import { NonEmptyString1000, useEvolu } from "@evolu/react";
import type { Database } from "@/db/db";
import { Brand } from "effect/Brand";

interface SectionDialogProps {
  notebookId: string & Brand<"Id"> & Brand<"Notebook">;
  children: any;
}

export const SectionDialog = ({ notebookId, children }: SectionDialogProps) => {
  const [sectionName, setSectionName] = React.useState("");

  const { create } = useEvolu<Database>();

  const handler = () => {
    create("sections", {
      title: S.decodeSync(NonEmptyString1000)(sectionName),
      notebookId: notebookId,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Section</DialogTitle>
          <DialogDescription>
            Organise your toughts and ideas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="new section"
            onChange={(e) => setSectionName(e.target.value)}
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
  );
};
