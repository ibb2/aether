'use client'

import * as S from '@effect/schema/Schema'
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
} from '@evolu/react'
import {
    ExportedDatasTable,
    FragmentsTable,
    NonEmptyString50,
    NotebooksTable,
    NoteSettingId,
    NotesSettingsTable,
    NotesTable,
    SectionsTable,
    SettingsTable,
    UsersTable,
} from './schema'
import { indexes } from './indexes'
import { initialContent } from '@/lib/data/initialContent'
import useNoteStore from '@/store/note'
import { blankContent } from '@/lib/data/blankContent'
import { trace } from 'next/dist/trace'

const Database = database({
    users: UsersTable,
    notebooks: NotebooksTable,
    sections: SectionsTable,
    fragments: FragmentsTable,
    notes: NotesTable,
    noteSettings: NotesSettingsTable,
    exportedData: ExportedDatasTable,
    settings: SettingsTable,
})
export type Database = typeof Database.Type

export const evolu = createEvolu(Database, {
    indexes,
    syncUrl: process.env.EVOLU_SERVER_URL,
    minimumLogLevel: 'trace',
})
