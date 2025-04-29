import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { S3 } from '@/lib/aws/s3client'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function DELETE(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    })
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const docId = searchParams.get('docId')

    if (docId === null) return NextResponse.json({ error: 'No id passed' })

    const bucket = process.env.BUCKET_NAME!

    const key = session?.user?.id + '/' + docId
    try {
        // List all objects in the "folder"
        const listCommand = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: key,
        })
        const listResponse = await S3.send(listCommand)

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return NextResponse.json(
                { error: 'Bucket name and folder prefix are required.' },
                { status: 400 }
            )
        }

        // Prepare objects for deletion
        const objectsToDelete = listResponse.Contents.map((item) => ({
            Key: item.Key,
        }))

        // Delete the objects
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: objectsToDelete,
            },
        })
        const deleteResponse = await S3.send(deleteCommand)

        return NextResponse.json(
            {
                message: 'Folder contents deleted successfully.',
                deleted: deleteResponse.Deleted,
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                error: 'An error occurred while deleting the folder.',
            },
            { status: 500 }
        )
    }
}
