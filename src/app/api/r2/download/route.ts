import { auth } from '@/lib/auth'
import { S3 } from '@/lib/aws/s3client'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    })
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('fileId')
    const docId = searchParams.get('docId')

    if (fileId === null || docId === null)
        return NextResponse.json({ error: 'No id passed' })

    const bucket = process.env.BUCKET_NAME!

    const key = session?.user?.id + '/' + docId + '/' + fileId

    try {
        // (!) We're now signing the URL with a GetObjectCommand
        const url = await getSignedUrl(
            S3,
            new GetObjectCommand({ Bucket: bucket, Key: key }),
            { expiresIn: 86400 } // 1 day
        )

        return NextResponse.json({ url })
    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to connect to object storage',
        })
    }
}
