import ProfileForm from '@/components/auth/profile/ProfileForm'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import React from 'react'

export default function Profile() {
    return (
        <Card x-chunk="dashboard-04-chunk-1" className="border-0">
            <CardHeader>
                <CardTitle>Personal Info</CardTitle>
                <CardDescription>
                    Update your personal information.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-20">
                <ProfileForm />
            </CardContent>
        </Card>
    )
}
