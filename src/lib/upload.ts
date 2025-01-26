import * as S from '@effect/schema/Schema'
import useNoteStore from '@/store/note'
import { handleFileUploadOPFS } from './images'
import { Editor } from '@tiptap/react'

export async function handlePasteAndDrop(
    editor: Editor,
    file: File,
    pos: number
) {
    const encodedDocId = useNoteStore.getState().noteId
    const docId = S.decodeSync(S.String)(encodedDocId!)

    const fileId = await handleFileUploadOPFS(docId, file)
    const url = URL.createObjectURL(file)

    editor
        .chain()
        .insertContentAt(pos, {
            type: 'image',
            attrs: {
                src: url,
                dataFileId: fileId,
                alt: file.name,
            },
        })
        .focus()
        .run()

    const response = await fetch('/api/r2/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            docId: docId,
            fileId: fileId,
        }),
    })

    const { url: presignedUrl } = await response.json()

    await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
    })
}
