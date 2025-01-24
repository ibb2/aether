// CustomImage.js
import { mergeAttributes, Node } from '@tiptap/core'
import { Image as BaseImage } from '@tiptap/extension-image'

export const Image = BaseImage.extend({
    name: 'image', // Overriding the name to ensure it works with existing image handling

    // Define custom attributes
    addAttributes() {
        return {
            ...this.parent?.(), // Include default attributes from the base Image extension
            dataFileId: {
                default: null, // Default value for the custom attribute
                parseHTML: (element) => element.getAttribute('data-file-id'), // Parse `data-file-id` from HTML
                renderHTML: (attributes) => {
                    if (!attributes.dataFileId) {
                        return {} // Don't add the attribute if it's null
                    }
                    return {
                        'data-file-id': attributes.dataFileId, // Add `data-file-id` to the rendered HTML
                    }
                },
            },
        }
    },

    // Parse the HTML to find `img[src]` elements
    parseHTML() {
        return [{ tag: 'img[src]' }]
    },

    // Render the HTML for the image node
    renderHTML({ HTMLAttributes }) {
        return [
            'img',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        ]
    },
})
