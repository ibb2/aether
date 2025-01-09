import { useEffect, useMemo, useState } from 'react'
import { Editor, useCurrentEditor } from '@tiptap/react'
import { TiptapCollabProvider, WebSocketStatus } from '@hocuspocus/provider'
import { useSidebar } from './useSidebar'

export const useBlockEditor = ({
    provider,
}: {
    provider?: TiptapCollabProvider | null | undefined
}) => {
    const leftSidebar = useSidebar()
    const { editor } = useCurrentEditor()
    const [collabState, setCollabState] = useState<WebSocketStatus>(
        WebSocketStatus.Connecting
    )

    const users = useMemo(() => {
        if (!editor?.storage.collaborationCursor?.users) {
            return []
        }
        return editor.storage.collaborationCursor.users.map((user) => {
            const names = user.name?.split(' ')
            const firstName = names?.[0]
            const lastName = names?.[names.length - 1]
            const initials = `${firstName?.[0] || '?'}${lastName?.[0] || '?'}`
            return { ...user, initials: initials.length ? initials : '?' }
        })
    }, [editor?.storage.collaborationCursor?.users])

    const characterCount = editor?.storage.characterCount || {
        characters: () => 0,
        words: () => 0,
    }

    useEffect(() => {
        provider?.on('status', (event: { status: WebSocketStatus }) => {
            setCollabState(event.status)
        })
    }, [provider])

    return { editor, users, characterCount, collabState, leftSidebar }
}
