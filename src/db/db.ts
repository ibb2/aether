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
  useQuery,
} from "@evolu/react";
import {
  ExportedDatasTable,
  NonEmptyString50,
  NotebooksTable,
  NotesTable,
  SectionsTable,
  UsersTable,
} from "./schema";
import { indexes } from "./indexes";
import { initialContent } from "@/lib/data/initialContent";
import useNoteStore from "@/store/note";
import { blankContent } from "@/lib/data/blankContent";

const Database = database({
  users: UsersTable,
  notebooks: NotebooksTable,
  sections: SectionsTable,
  notes: NotesTable,
  exportedData: ExportedDatasTable,
});
export type Database = typeof Database.Type;

export const evolu = createEvolu(Database, {
  indexes,
  initialData: (evolu) => {
    // Create a default notebook, note and exported data for users.
    // This will essentiaily be the onboarding experience for users in due time.

    const initialized = localStorage.getItem("isInitialized");
    const defaultData = localStorage.getItem("default");

    const setNote = useNoteStore.getState().setNote;

    if (defaultData !== null) {
      const { data, name, note_id, exported_data_id } = JSON.parse(defaultData);
      setNote(data, name, note_id, exported_data_id);
    }

    if (initialized === null || JSON.parse(initialized) === 0) {
      const { id: notebookId } = evolu.create("notebooks", {
        title: S.decodeSync(NonEmptyString1000)("My first journal"),
      });

      const { id: noteId } = evolu.create("notes", {
        title: S.decodeSync(NonEmptyString1000)("Initial note"),
        notebookId,
      });

      const { id: exportedDataId } = evolu.create("exportedData", {
        noteId,
        jsonExportedName: S.decodeSync(NonEmptyString50)(`doc_${noteId}`),
        jsonData: blankContent,
      });

      setNote(blankContent, `doc_${noteId}`, noteId, exportedDataId);

      const defaultDataRaw = {
        data: blankContent,
        name: `doc_${noteId}`,
        note_id: noteId,
        exported_data_id: exportedDataId,
      };

      localStorage.setItem("isInitialized", JSON.stringify(1));
      localStorage.setItem("default", JSON.stringify(defaultDataRaw));

      console.log("Created initial data");
    }
  },
});
