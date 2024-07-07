import { createIndexes } from "@evolu/react";

export const indexes = createIndexes((create) => [
  // User indexes
  create("indexUserCreatedAt").on("users").column("createdAt"),
  // Notebook indexes
  create("indexNotebooksCreatedAt").on("notebooks").column("createdAt"),
  // Notes indexes
  create("indexNoteCreatedAt").on("notes").column("createdAt"),
  // Exported Data indexes
  create("indexExportedDataCreatedAt").on("exportedData").column("createdAt"),
  // create("indexExportedDataNoteId").on("exportedData").column("userId"),
]);
