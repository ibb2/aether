import { S3Client } from './aws/s3client'

export class API {
    public static uploadImage = async () => {
        const AWS = require('aws-sdk')
        const crypto = require('crypto')

        const ACCOUNT_ID = process.env.R2_ACCOUNT_ID
        const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
        const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
        const BUCKET_NAME = process.env.R2_BUCKET_NAME

        // Hash the secret access key
        const hashedSecretKey = crypto
            .createHash('sha256')
            .update(SECRET_ACCESS_KEY)
            .digest('hex')

        // Configure the S3 client for Cloudflare R2
        const s3Client = S3Client

        // Specify the object key
        const objectKey = '2024/08/02/ingested_0001.parquet'

        // Function to fetch the object
        async function fetchObject() {
            try {
                const params = {
                    Bucket: BUCKET_NAME,
                    Key: objectKey,
                }

                const data = await s3Client.getObject(params).promise()
                console.log('Successfully fetched the object')

                // Process the data as needed
                // For example, to get the content as a Buffer:
                // const content = data.Body;

                // Or to save the file (requires 'fs' module):
                // const fs = require('fs').promises;
                // await fs.writeFile('ingested_0001.parquet', data.Body);
            } catch (error) {
                console.error('Failed to fetch the object:', error)
            }
        }

        fetchObject()

        await new Promise((r) => setTimeout(r, 500))
        return '/placeholder-image.jpg'
    }
}

export default API
