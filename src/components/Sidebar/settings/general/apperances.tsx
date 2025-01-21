'use client'

import CopySecret from '@/components/copy/CopySecret'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { evolu } from '@/db/db'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Appearance() {
    const { theme, setTheme } = useTheme()

    return (
        <Card x-chunk="dashboard-04-chunk-1" className="border-0">
            <CardHeader>
                <CardTitle>Personalization</CardTitle>
                <CardDescription>Customize to your taste.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-20 gap-y-5">
                <div className="flex flex-col">
                    <div className="flex flex-col justify-between gap-y-2">
                        <Label htmlFor="mnemonic">Theme</Label>
                        <Select defaultValue={theme} onValueChange={setTheme}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-x-1">
                                            <Moon size={18} />
                                            Dark
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-x-1">
                                            <Sun size={18} /> Light
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-x-1">
                                            <Monitor size={18} /> System
                                        </div>
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
