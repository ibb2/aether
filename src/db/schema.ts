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
import { ReactSketchCanvas, CanvasPath } from "react-sketch-canvas";

// Table Id's'
export const UserId = id("User");
export type UserId = typeof UserId.Type;

export const NotebookId = id("Notebook");
export type NotebookId = typeof NotebookId.Type;

export const SectionId = id("Section");
export type SectionId = typeof SectionId.Type;

export const FragmentId = id("Fragment");
export type FragmentId = typeof FragmentId.Type;

export const NoteId = id("Note");
export type NoteId = typeof NoteId.Type;

export const NoteSettingId = id("NoteSetting");
export type NoteSettingId = typeof NoteSettingId.Type;

export const ExportedDataId = id("ExportedData");
export type ExportedDataId = typeof ExportedDataId.Type;

export const SettingId = id("Setting");
export type SettingId = typeof SettingId.Type;

export const SubscriptionId = id("Subscription");
export type SubscriptionId = typeof SubscriptionId.Type;

// Custom Datatypes
export const NonEmptyString50 = String.pipe(
  S.minLength(1),
  S.maxLength(50),
  S.brand("NonEmptyString50"),
);
export type NonEmptyString50 = typeof NonEmptyString50.Type;

// Define CanvasPath Schema
// Chat GPT
// Define CanvasPath Schema
export const PathSchema = S.Struct({
  x: S.Number,
  y: S.Number,
});

export const CanvasPathSchema = S.Struct({
  drawMode: S.Boolean,
  endTimestamp: S.Number,
  paths: S.Array(PathSchema),
  startTimestamp: S.Number,
  strokeColor: S.String,
  strokeWidth: S.Number,
});
export type CanvasPathSchema = typeof CanvasPathSchema.Type;

// Define CanvasPathArray Schema
export const CanvasPathArray = S.Array(CanvasPathSchema);
export type CanvasPathArray = typeof CanvasPathArray.Type;

export const NotesId = S.Array(String);

export const SectionsId = S.Array(SectionId);

// Enum for page types
enum PageType {
  "Default" = 1,
  "Dotted",
  "Grid",
}

// Tables
export const UsersTable = table({
  id: UserId,
  firstName: NonEmptyString50,
  lastName: NonEmptyString50,
  email: NonEmptyString50,
  premium: SqliteBoolean,
  dob: NonEmptyString50,
  stripeCustomerId: S.NullOr(NonEmptyString50),
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
  notebookId: S.NullOr(NotebookId),
  notesId: S.NullOr(S.Array(NoteId)),
  userId: S.NullOr(UserId),
  parentId: S.NullOr(SectionId),
  childrenId: S.NullOr(SectionsId),
  isPinned: S.NullOr(SqliteBoolean),
  isSection: S.NullOr(SqliteBoolean),
  isFolder: S.NullOr(SqliteBoolean),
});
export type SectionsTable = typeof SectionsTable.Type;

export const FragmentsTable = table({
  id: FragmentId,
  notesId: S.NullOr(S.Array(NoteId)),
  userId: S.NullOr(UserId),
});
export type FragmentsTable = typeof FragmentsTable.Type;

export const NotesTable = table({
  id: NoteId,
  title: NonEmptyString1000,
  notebookId: S.NullOr(NotebookId),
  sectionId: S.NullOr(SectionId),
  isFragment: S.NullOr(SqliteBoolean),
  exportedData: S.NullOr(ExportedDataId),
  userId: S.NullOr(UserId),
  isNote: S.NullOr(SqliteBoolean),
});
export type NotesTable = typeof NotesTable.Type;

export const NotesSettingsTable = table({
  id: NoteSettingId,
  noteId: S.NullOr(NoteId),
  pageType: S.NullOr(S.Enums(PageType)),
  isInkEnabled: S.NullOr(SqliteBoolean),
  isPageSplit: S.NullOr(SqliteBoolean),
});
export type NotesSettingsTable = typeof NotesSettingsTable.Type;

export const ExportedDatasTable = table({
  id: ExportedDataId,
  noteId: NoteId,
  jsonExportedName: S.NullOr(NonEmptyString50),
  jsonData: S.Struct({}),
  yjsExportedName: S.NullOr(NonEmptyString50),
  inkData: S.NullOr(CanvasPathArray),
  // yjsExportedData: S.Uint8Array,
});
export type ExportedDatasTable = typeof ExportedDatasTable.Type;

export const SettingsTable = table({
  id: SettingId,
  title: NonEmptyString50,
  defaultPage: S.NullOr(S.Struct({})),
  lastAccessedNote: S.NullOr(NoteId) || S.NullOr(FragmentId),
  defaultPageExport: S.NullOr(ExportedDataId),
});

export type SettingsTable = typeof SettingsTable.Type;

export const SubscriptionsTable = table({
  id: SubscriptionId,
  userId: UserId,
  stripeSubscriptionId: NonEmptyString50,
  status: NonEmptyString50,
  priceId: NonEmptyString50,
  currentPeriodStart: NonEmptyString50,
  currentPeriodEnd: NonEmptyString50,
  cancelAtPeriodEnd: SqliteBoolean,
});
export type SubscriptionsTable = typeof SubscriptionsTable.Type;
