import { evolu } from "./db";

export const notebooksQuery = evolu.createQuery((db) =>
  db.selectFrom("notebooks").selectAll(),
);

export const sectionsQuery = evolu.createQuery((db) =>
  db.selectFrom("sections").selectAll(),
);

export const notesQuery = evolu.createQuery((db) =>
  db.selectFrom("notes").selectAll(),
);

export const initialExportedData = evolu.createQuery((db) =>
  db.selectFrom("exportedData").selectAll(),
);
