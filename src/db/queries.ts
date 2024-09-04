import * as S from "@effect/schema/Schema";
import { evolu } from "./db";
import { cast } from "@evolu/react";

export const notebooksQuery = evolu.createQuery((db) =>
  db
    .selectFrom("notebooks")
    .where("isDeleted", "is not", cast(true))
    .selectAll(),
);

export const sectionsQuery = evolu.createQuery((db) =>
  db
    .selectFrom("sections")
    .where("isDeleted", "is not", cast(true))
    .selectAll(),
);

export const fragmentsQuery = evolu.createQuery((db) =>
  db
    .selectFrom("notes")
    .where("isDeleted", "is not", cast(true))
    .where("isFragment", "is", cast(true))
    .selectAll(),
);

export const notesQuery = evolu.createQuery((db) =>
  db.selectFrom("notes").where("isDeleted", "is not", cast(true)).selectAll(),
);

export const initialExportedData = evolu.createQuery((db) =>
  db.selectFrom("exportedData").selectAll(),
);

export const settingQuery = evolu.createQuery((db) =>
  db.selectFrom("settings").selectAll(),
);
