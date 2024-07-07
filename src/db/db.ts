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
  NotebooksTable,
  NotesTable,
  UsersTable,
} from "./schema";
import { indexes } from "./indexes";

const Database = database({
  users: UsersTable,
  notebooks: NotebooksTable,
  notes: NotesTable,
  exportedData: ExportedDatasTable,
});
type Database = typeof Database.Type;

const evolu = createEvolu(Database, { indexes });
