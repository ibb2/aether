import * as S from "@effect/schema/Schema";
import {
  NonEmptyString1000,
  SqliteBoolean,
  String,
  cast,
  database,
  id,
  table,
  createEvolu,
} from "@evolu/react";
import {
  ExportedDatasTable,
  NonEmptyString50,
  NotebooksTable,
  NotesTable,
  UsersTable,
} from "./schema";
import { indexes } from "./indexes";
import { initialContent } from "@/lib/data/initialContent";
import useNoteStore from "@/store/note";
import { blankContent } from "@/lib/data/blankContent";

const Database = database({
  users: UsersTable,
  notebooks: NotebooksTable,
  notes: NotesTable,
  exportedData: ExportedDatasTable,
});
export type Database = typeof Database.Type;

export const evolu = createEvolu(Database, {
  indexes,
  initialData: (evolu) => {
    // Create a default notebook, note and exported data for users.
    // This will essentiaily be the onboarding experience for users in due time.

    const { id: notebookId } = evolu.create("notebooks", {
      title: S.decodeSync(NonEmptyString1000)("My first journal"),
    });

    const { id: noteId } = evolu.create("notes", {
      name: S.decodeSync(NonEmptyString1000)("Initial note"),
      notebookId,
    });

    evolu.create("exportedData", {
      noteId,
      jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${noteId}`),
      jsonData: blankContent,
    });

    const setNote = useNoteStore.getState().setNote;

    setNote(blankContent, `doc_${noteId}`, noteId);

    console.log("Created initial data");
  },
});
