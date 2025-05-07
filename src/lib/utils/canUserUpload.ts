'use client'

import { authClient } from '../auth-client'

const PRO_UPLOAD_SIZE = 5242880
const OTHER_SIZES = 1048576

export default async function canUserUpload(
    size: number
): Promise<[boolean, string]> {
    const { data: session, error } = await authClient.getSession()

    var res = await fetch(`/api/stripe/subscription/${session?.user.email}`)

    var result = await res.json()

    if (result.plan !== 'pro' && size > OTHER_SIZES) return [false, result.plan]

    if (result.plan == 'pro' && size > PRO_UPLOAD_SIZE)
        return [false, result.plan]

    return [true, result.plan]
}
