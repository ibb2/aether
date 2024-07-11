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

// Table Id's'
export const UserId = id("User");
export type UserId = typeof UserId.Type;

export const NotebookId = id("Notebook");
export type NotebookId = typeof NotebookId.Type;

export const SectionId = id("Section");
export type SectionId = typeof SectionId.Type;

export const NoteId = id("Note");
export type NoteId = typeof NoteId.Type;

export const ExportedDataId = id("ExportedData");
export type ExportedDataId = typeof ExportedDataId.Type;

// Custom Datatypes
export const NonEmptyString50 = String.pipe(
  S.minLength(1),
  S.maxLength(50),
  S.brand("NonEmptyString50"),
);
export type NonEmptyString50 = typeof NonEmptyString50.Type;

export const NotesId = S.Array(String);

// Tables
export const UsersTable = table({
  id: UserId,
  firstName: NonEmptyString50,
  lastName: NonEmptyString50,
  email: NonEmptyString50,
  premium: SqliteBoolean,
  dob: NonEmptyString50,
});
export type UsersTable = typeof UsersTable.Type;

export const NotebooksTable = table({
  id: NotebookId,
  title: NonEmptyString1000,
  notesId: S.NullOr(NotesId),
  userId: S.NullOr(UserId),
  isPinned: S.NullOr(SqliteBoolean),
});
export type NotebooksTable = typeof NotebooksTable.Type;

export const SectionsTable = table({
  id: SectionId,
  title: NonEmptyString1000,
  notebookId: NotebookId,
  notesId: S.NullOr(NotesId),
  userId: S.NullOr(UserId),
  isPinned: S.NullOr(SqliteBoolean),
  isSection: S.NullOr(SqliteBoolean),
  isFolder: S.NullOr(SqliteBoolean),
});
export type SectionsTable = typeof SectionsTable.Type;

export const NotesTable = table({
  id: NoteId,
  title: NonEmptyString1000,
  notebookId: NotebookId,
  exportedData: S.NullOr(ExportedDataId),
  userId: S.NullOr(UserId),
  isNote: S.NullOr(SqliteBoolean),
});
export type NotesTable = typeof NotesTable.Type;

export const ExportedDatasTable = table({
  id: ExportedDataId,
  noteId: NoteId,
  jsonExportedName: S.NullOr(NonEmptyString50),
  jsonData: S.Struct({}),
  yjsExportedName: S.NullOr(NonEmptyString50),
  // yjsExportedData: S.Uint8Array,
});
export type ExportedDatasTable = typeof ExportedDatasTable.Type;
