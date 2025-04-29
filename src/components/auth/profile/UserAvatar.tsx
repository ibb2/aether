'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Image from 'next/image'
import { NextResponse } from 'next/server'

export default async function UserAvatar() {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    })
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    return (
        <div>
            <Image
                src={session.user.image ?? ''}
                alt="User Avatar"
                width={32}
                height={32}
            />
        </div>
    )
}
