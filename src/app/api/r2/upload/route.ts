import { auth } from '@/auth'
import { S3 } from '@/lib/aws/s3client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function POST(request: Request) {
    const data = await auth()
    if (data?.user === undefined) return Response.error()

    const { filename, contentType, docId, fileId } = await request.json()

    try {
        const key = data?.user?.id + '/' + docId + '/' + fileId
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
