import { evolu } from "./db";

export const notebooksQuery = evolu.createQuery((db) =>
  db.selectFrom("notebooks").selectAll(),
);
