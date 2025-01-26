'use client'

import * as S from '@effect/schema/Schema'

import { HocuspocusProvider } from '@hocuspocus/provider'

import { API } from '@/lib/api'

import {
    BlockquoteFigure,
    CharacterCount,
    Color,
    Document,
    Dropcursor,
    Emoji,
    Figcaption,
    FileHandler,
    Focus,
    FontFamily,
    FontSize,
    Heading,
    Highlight,
    HorizontalRule,
    Image,
    ImageBlock,
    Link,
    Placeholder,
    Selection,
    SlashCommand,
    StarterKit,
    Subscript,
    Superscript,
    Table,
    TableOfContents,
    TableCell,
    TableHeader,
    TableRow,
    TextAlign,
    TextStyle,
    TrailingNode,
    Typography,
    Underline,
    emojiSuggestion,
    Columns,
    Column,
    TaskItem,
    TaskList,
    History,
} from '.'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { ImageUpload } from './ImageUpload'
import { TableOfContentsNode } from './TableOfContentsNode'
import { common, createLowlight } from 'lowlight'
const lowlight = createLowlight(common)
import BubbleMenu from '@tiptap/extension-bubble-menu'
import Blockquote from '@tiptap/extension-blockquote'
import { evolu } from '@/db/db'
import { useSession } from 'next-auth/react'
import { handleFileUploadOPFS } from '@/lib/images'
import useNoteStore from '@/store/note'

interface ExtensionKitProps {
    provider?: HocuspocusProvider | null
    userId?: string
    userName?: string
    userColor?: string
}

const Title = Heading.extend({
    name: 'title',
    group: 'title',
    parseHTML: () => [{ tag: 'h1:first-child' }],
}).configure({ levels: [1] })

const DocumentWithTitle = Document.extend({
    content: 'title block+',
})

export const ExtensionKit = ({
    provider,
    userId,
    userName = 'Maxi',
}: ExtensionKitProps) => [
    Blockquote.extend({
        addAttributes() {
            return {
                class: {
                    default: 'custom-blockquote',
                },
            }
        },
    }),
    DocumentWithTitle,
    Title,
    Columns,
    BubbleMenu.configure({}),
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
    Column,
    Selection,
    Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
    }),
    HorizontalRule,
    StarterKit.configure({
        document: false,
        dropcursor: false,
        heading: false,
        horizontalRule: false,
        blockquote: false,
        history: false,
        codeBlock: false,
    }),
    CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: null,
    }),
    TextStyle,
    FontSize,
    FontFamily,
    Color,
    TrailingNode,
    Link.configure({
        openOnClick: false,
    }),
    Highlight.configure({ multicolor: true }),
    Underline,
    CharacterCount.configure({ limit: 50000 }),
    History,
    TableOfContents,
    TableOfContentsNode,
    Image,
    ImageUpload.configure({
        clientId: provider?.document?.clientID,
    }),
    ImageBlock,
    FileHandler.configure({
        allowedMimeTypes: [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
        ],
        onDrop: (currentEditor, files, pos) => {
            const encodedDocId = useNoteStore.getState().noteId
            const docId = S.decodeSync(S.String)(encodedDocId!)

            files.forEach(async (file) => {
                const fileId = await handleFileUploadOPFS(docId, file)
                const url = URL.createObjectURL(file)

                currentEditor
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
            })
        },
        onPaste: (currentEditor, files) => {
            files.forEach(async () => {
                const url = await API.uploadImage()

                return currentEditor
                    .chain()
                    .setImageBlockAt({
                        pos: currentEditor.state.selection.anchor,
                        src: url,
                    })
                    .focus()
                    .run()
            })
        },
    }),
    Emoji.configure({
        enableEmoticons: true,
        suggestion: emojiSuggestion,
    }),
    TextAlign.extend({
        addKeyboardShortcuts() {
            return {}
        },
    }).configure({
        types: ['heading', 'paragraph'],
    }),
    Subscript,
    Superscript,
    Table,
    TableCell,
    TableHeader,
    TableRow,
    Typography,
    Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: false,
        // placeholder: () => '',
        placeholder: ({ editor, node }) => {
            const isTitleEmpty =
                editor?.view.state.doc.firstChild?.textContent.trim() === ''

            if (node.type.name === 'title') {
                return 'Untitled' // Placeholder for headings
            }

            return '' // Placeholder for paragraphs
        },
    }),
    SlashCommand,
    Focus,
    Figcaption,
    BlockquoteFigure,
    Dropcursor.configure({
        width: 2,
        class: 'ProseMirror-dropcursor border-black',
    }),
]

export default ExtensionKit
