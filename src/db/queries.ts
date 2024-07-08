import { evolu } from "./db";

export const notebooksQuery = evolu.createQuery((db) =>
  db.selectFrom("notebooks").selectAll(),
);

export const notesQuery = evolu.createQuery((db) =>
  db.selectFrom("notes").selectAll(),
);
