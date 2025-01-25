import AWS, { S3Client } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const ACCOUNT_ID = process.env.ACCOUNT_ID
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY
const BUCKET_NAME = process.env.BUCKET_NAME

export const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
})

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
