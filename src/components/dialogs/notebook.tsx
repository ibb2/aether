"use client";

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

export const NotebookDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New notebook</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New notebook</DialogTitle>
          <DialogDescription>
            Organise your toughts and ideas in a new space.
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-1.5 py-3.5">
          <Label htmlFor="name">Name</Label>
          <Input type="text" id="name" placeholder="new notebook" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
