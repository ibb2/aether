'use client'

import ProfileForm from '@/components/auth/profile/ProfileForm'
import CopySecret from '@/components/copy/CopySecret'
import { Button } from '@/components/ui/Button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { evolu } from '@/db/db'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Settings() {
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
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="grid gap-6">
                    <Card
                        x-chunk="dashboard-04-chunk-1"
                        className="grid gap-3 "
                    >
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Account related settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-x-20 gap-y-5">
                            <div className="flex flex-col justify-between w-full">
                                <div className="grid">
                                    <h1>Mnemonic</h1>
                                    <div className="flex items-center space-x-2">
                                        {/* <Checkbox id="include" defaultChecked /> */}
                                        <span className="text-sm font-light text-gray-400">
                                            Responsible for sync, DO NOT SHARE,
                                            DO NOT LOSE.
                                        </span>
                                    </div>
                                </div>
                                <CopySecret />
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        x-chunk="dashboard-04-chunk-1"
                        className="grid gap-3 "
                    >
                        <CardHeader>
                            <CardTitle>Info</CardTitle>
                            <CardDescription>
                                Update your personal information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-x-20 gap-y-5">
                            <ProfileForm />
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-04-chunk-1" className="grid gap-3">
                        <CardHeader>
                            <CardTitle>Delete</CardTitle>
                            <CardDescription>
                                Danger not reversible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-x-20 gap-y-5">
                            <div className="flex flex-col">
                                <div className="flex justify-between">
                                    <div className="grid">
                                        <Label
                                            htmlFor="mnemonic"
                                            className="text-lg"
                                        >
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
                                        Delete&apos;s all the data in the local
                                        database. A clean start.
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
                </div>
            </main>
        </div>
    )
}
