// utils/processImages.ts
import * as S from '@effect/schema/Schema'
import useNoteStore from '@/store/note'
import { Editor } from '@tiptap/core'
import { auth } from '@/auth'

const urlCache = new Map<string, string>()

// utils/processImages.ts
export async function processImages(editor: Editor) {
    const encodedDocId = useNoteStore.getState().noteId
    const docId = S.decodeSync(S.String)(encodedDocId!)

    // Use ProseMirror's node positions for more reliable updates
    const imagePositions: Array<{ pos: number; fileId: string }> = []

    editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.dataFileId) {
            imagePositions.push({
                pos,
                fileId: node.attrs.dataFileId,
            })
        }
    })

    // Process in batches using microtasks
    for (const { pos, fileId } of imagePositions) {
        try {
            // Use existing URL if already resolved
            const existingUrl = urlCache.get(fileId)
            if (
                existingUrl &&
                editor.state.doc.nodeAt(pos)?.attrs.src === existingUrl
            ) {
                continue
            }

            // Get fresh URL (OPFS first, then R2 fallback)
            const url = await resolveFileUrl(fileId, docId)

            // Update using ProseMirror transaction for direct state manipulation
            editor.view.dispatch(
                editor.state.tr.setNodeMarkup(pos, undefined, {
                    ...editor.state.doc.nodeAt(pos)?.attrs,
                    src: url,
                })
            )

            // Force a DOM update for the specific node
            const domNode = editor.view.nodeDOM(pos) as HTMLImageElement
            if (domNode && domNode.tagName === 'IMG') {
                domNode.src = url
            }
        } catch (error) {
            console.error('Error processing image at pos', pos, error)
            // Set error state if needed
            editor.view.dispatch(
                editor.state.tr.setNodeMarkup(pos, undefined, {
                    ...editor.state.doc.nodeAt(pos)?.attrs,
                    src: '/image-error-placeholder.png',
                })
            )
        }
    }
}

// Separate URL resolution logic
async function resolveFileUrl(fileId: string, docId: string) {
    if (urlCache.has(fileId)) return urlCache.get(fileId)!

    try {
        // Try OPFS first
        const opfs = await navigator.storage.getDirectory()
        const aetherDirectory = await opfs.getDirectoryHandle('aether', {
            create: true,
        })
        const fileHandle = await aetherDirectory.getFileHandle(fileId)
        const file = await fileHandle.getFile()
        const url = URL.createObjectURL(file)
        urlCache.set(fileId, url)
        return url
    } catch (opfsError) {
        // Fallback to R2
        const response = await fetch(
            `/api/r2/download/?fileId=${fileId}&docId=${docId}`
        )
        if (!response.ok) throw new Error('R2 fetch failed')

        const { url } = await response.json()
        urlCache.set(fileId, url)
        return url
    }
}
