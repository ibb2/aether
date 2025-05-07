import * as S from '@effect/schema/Schema'
import useNoteStore from '@/store/note'
import { handleFileUploadOPFS } from './images'
import { Editor } from '@tiptap/react'
import canUserUpload from './utils/canUserUpload'
import { toast } from '@/hooks/use-toast'
import { Alert } from '@/components/ui/alert'

function errorToast(plan: string) {
    const limit = plan === 'pro' ? '5MB' : '1MB'

    toast({
        title: 'Could not upload file',
        description: `File is to large, please upload a file smaller than ${limit}`,
        variant: 'destructive',
    })
}

export async function handlePasteAndDrop(
    editor: Editor,
    file: File,
    pos: number
) {
    const encodedDocId = useNoteStore.getState().noteId
    const docId = S.decodeSync(S.String)(encodedDocId!)

    const fileId = await handleFileUploadOPFS(docId, file)
    const url = URL.createObjectURL(file)

    const [canUpload, plan] = await canUserUpload(file.size)

    if (!canUpload) {
        errorToast(plan)
        return
    }

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
