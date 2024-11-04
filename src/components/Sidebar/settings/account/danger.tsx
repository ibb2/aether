import ProfileForm from '@/components/auth/profile/ProfileForm'
import CopySecret from '@/components/copy/CopySecret'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { evolu } from '@/db/db'

import { Label } from '@radix-ui/react-context-menu'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Danger() {
    const router = useRouter()

    const [saving, setSaving] = React.useState(false)

    const uint8ArrayToBlob = (uint8Array: Uint8Array) => {
        // SQLite files should use 'application/x-sqlite3' MIME type
        return new Blob([uint8Array], { type: 'application/x-sqlite3' })
    }

    const download = async () => {
        const data = await evolu.exportDatabase()
        const blob = uint8ArrayToBlob(data)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'aether.sqlite3'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const nuke = () => {
        window.localStorage.removeItem('analytics_allowed')
        evolu.resetOwner({ reload: true })
        // router.push("/app");
    }
    return (
        <Card x-chunk="dashboard-04-chunk-1" className="border-0">
            <CardHeader>
                <CardTitle>Delete</CardTitle>
                <CardDescription>Danger not reversible.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-20 gap-y-5">
                <div className="flex flex-col">
                    <div className="flex justify-between">
                        <div className="grid">
                            <Label htmlFor="mnemonic" className="text-lg">
                                Export
                            </Label>
                            <span className="text-sm font-light text-gray-400">
                                Downloads the entire database.
                            </span>
                        </div>
                        <Button className="w-32" onClick={download}>
                            Export Database
                        </Button>
                    </div>
                </div>
                <div className="flex flex-row justify-between">
                    <div className="grid">
                        <h1>Delete Data</h1>
                        <span className="text-sm font-light text-gray-400">
                            Delete&apos;s all the data in the local database.
                        </span>
                    </div>
                    <Button
                        variant="destructive"
                        className="w-32"
                        onClick={nuke}
                    >
                        Delete Data
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
