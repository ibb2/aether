// utils/processImages.ts
import { Editor } from '@tiptap/core'

const blobUrlCache = new Map<string, string>()

export async function processImages(editor: Editor) {
    // Get all image nodes with data-file-id

    const imageNodes: Array<{ node: any; pos: number }> = []

    editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.dataFileId) {
            imageNodes.push({ node, pos })
        }
    })

    // Process images in a single animation frame
    await new Promise((resolve) => requestAnimationFrame(resolve))

    console.log('Image nodes', imageNodes)
    for (const { node, pos } of imageNodes) {
        const fileId = node.attrs.dataFileId
        const currentSrc = node.attrs.src

        // Skip if already processed
        if (currentSrc?.startsWith('blob:') && blobUrlCache.has(fileId))
            continue

        try {
            // Get Blob URL from cache or OPFS
            let blobUrl = blobUrlCache.get(fileId)
            if (!blobUrl) {
                const opfs = await navigator.storage.getDirectory()
                const aetherDirectory = await opfs.getDirectoryHandle(
                    'aether',
                    {
                        create: true,
                    }
                )

                const fileHandle = await aetherDirectory.getFileHandle(fileId)
                const file = await fileHandle.getFile()
                console.log('File', file)
                blobUrl = URL.createObjectURL(file)
                blobUrlCache.set(fileId, blobUrl)
            }
            console.log('Blob url ', blobUrl)
            // Update the image's src without selecting the node
            // editor.commands.updateAttributes('image', { src: blobUrl }, { pos })
            editor.commands.command(({ chain }) => {
                return chain()
                    .setNodeSelection(pos)
                    .updateAttributes('image', {
                        src: blobUrl,
                    })
                    .run()
            })
        } catch (error) {
            console.error('Error processing image:', error)
        }
    }
}
