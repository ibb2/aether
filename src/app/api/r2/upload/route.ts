import { auth } from '@/lib/auth'
import { S3 } from '@/lib/aws/s3client'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    })
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { filename, contentType, docId, fileId } = await request.json()

    try {
        const key = session?.user?.id + '/' + docId + '/' + fileId
        const url = await getSignedUrl(
            S3,
            new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME!,
                Key: key,
            }),
            { expiresIn: 3600 }
        )

        return Response.json({ url })
    } catch (error: any) {
        return Response.json({ error: error.message })
    }
}

export async function DELETE(request: NextRequest) {
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
        const url = await getSignedUrl(
            S3,
            new DeleteObjectCommand({ Bucket: bucket, Key: key })
        )

        return NextResponse.json({ url })
    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to connect to object storage',
        })
    }
}
