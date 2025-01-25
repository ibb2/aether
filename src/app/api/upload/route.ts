import { auth } from '@/auth'
import { s3 } from 'bun'

export async function POST(request: Request) {
    const data = await auth()
    const { filename, contentType } = await request.json()

    try {
        const url = s3.presign(filename, {
            expiresIn: 3600,
            method: 'PUT',
            type: 'image',
            acl: 'public-read-write',
        })

        return Response.json({ url })
    } catch (error: any) {
        return Response.json({ error: error.message })
    }
}
