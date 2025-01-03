import CopySecret from '@/components/copy/CopySecret'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import React from 'react'

export default function Sync() {
    return (
        <Card x-chunk="dashboard-04-chunk-1" className="border-0">
            <CardHeader>
                <CardTitle>Sync</CardTitle>
                <CardDescription>
                    Paste into a new browser to sync.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-20 ">
                <div className="flex flex-col justify-between w-full">
                    <div className="grid">
                        <h1>Mnemonic</h1>
                        <div className="flex items-center space-x-2">
                            {/* <Checkbox id="include" defaultChecked /> */}
                            <span className="text-sm font-light text-gray-400">
                                Do note share or lose this.
                            </span>
                        </div>
                    </div>
                    <CopySecret />
                </div>
            </CardContent>
        </Card>
    )
}
