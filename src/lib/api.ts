// import { s3, write, S3Client } from 'bun'

export class API {
    public static uploadImage = async () => {
        // const AWS = require('aws-sdk')
        // const crypto = require('crypto')
        // const ACCOUNT_ID = process.env.ACCOUNT_ID
        // const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID
        // const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY
        // const BUCKET_NAME = process.env.BUCKET_NAME
        // // Hash the secret access key
        // const hashedSecretKey = crypto
        //     .createHash('sha256')
        //     .update(SECRET_ACCESS_KEY)
        //     .digest('hex')
        // // Specify the object key
        // const objectKey = '2024/08/02/ingested_0001.parquet'
        // // Function to fetch the object
        // async function fetchObject() {
        //     try {
        //         const params = {
        //             Bucket: BUCKET_NAME,
        //             Key: objectKey,
        //         }
        //         const data = await s3.getObject(params).promise()
        //         console.log('Successfully fetched the object')
        //         // Process the data as needed
        //         // For example, to get the content as a Buffer:
        //         // const content = data.Body;
        //         // Or to save the file (requires 'fs' module):
        //         // const fs = require('fs').promises;
        //         // await fs.writeFile('ingested_0001.parquet', data.Body);
        //     } catch (error) {
        //         console.error('Failed to fetch the object:', error)
        //     }
        // }
        // fetchObject()
        // await new Promise((r) => setTimeout(r, 500))
        // return '/placeholder-image.jpg'
    }
}

export default API
